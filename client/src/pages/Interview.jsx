import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import Spinner from '../components/Spinner';

const difficultyColor = {
  Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const categoryColor = {
  Technical: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Behavioral: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'System Design': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DSA: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const TIMER_DURATION = { Easy: 120, Medium: 180, Hard: 300 };

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Interview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintUsed, setHintUsed] = useState(new Set());
  const [skippedIds, setSkippedIds] = useState(new Set());
  const [answeredMap, setAnsweredMap] = useState({});
  const [showSkippedPrompt, setShowSkippedPrompt] = useState(false);

  const timerRef = useRef(null);
  const timeUpRef = useRef(null);
  const restoredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Restore persisted state on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(`interview-${sessionId}`);
    if (stored) {
      setQuestions(JSON.parse(stored));
    }
    const stateStr = sessionStorage.getItem(`interview-state-${sessionId}`);
    if (stateStr) {
      try {
        const saved = JSON.parse(stateStr);
        if (saved.currentIndex != null) setCurrentIndex(saved.currentIndex);
        if (saved.answer != null) setAnswer(saved.answer);
        if (saved.hintUsed) setHintUsed(new Set(saved.hintUsed));
        if (saved.skippedIds) setSkippedIds(new Set(saved.skippedIds));
        if (saved.answeredMap) setAnsweredMap(saved.answeredMap);
        if (saved.timeLeft != null && saved.savedAt != null) {
          const elapsed = Math.floor((Date.now() - saved.savedAt) / 1000);
          setTimeLeft(Math.max(0, saved.timeLeft - elapsed));
        }
        restoredRef.current = true;
      } catch (e) {
        console.error('Failed to restore interview state', e);
      }
    }
  }, [sessionId]);

  // Persist state on unload
  const stateRef = useRef({});
  stateRef.current = {
    currentIndex, answer, hintUsed: [...hintUsed],
    skippedIds: [...skippedIds], answeredMap, timeLeft,
  };

  useEffect(() => {
    const key = `interview-state-${sessionId}`;
    const save = () => {
      sessionStorage.setItem(key, JSON.stringify({ ...stateRef.current, savedAt: Date.now() }));
    };
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, [sessionId]);

  // Timer management
  useEffect(() => {
    if (questions.length === 0) return;
    if (feedback) {
      clearTimer();
      setTimeLeft(null);
      return;
    }
    const duration = TIMER_DURATION[questions[currentIndex]?.difficulty] || 180;

    if (!restoredRef.current) {
      setAnswer('');
      setFeedback(null);
      setError('');
      setHintVisible(false);
      setTimeLeft(duration);
    }
    restoredRef.current = false;

    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [currentIndex, questions.length, clearTimer]);

  // Auto-handle time up
  useEffect(() => {
    if (timeLeft === 0 && !feedback && questions.length > 0) {
      timeUpRef.current?.();
    }
  }, [timeLeft]);

  if (questions.length === 0) {
    return <Spinner text="Loading questions..." />;
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const total = questions.length;
  const timerDuration = TIMER_DURATION[currentQuestion?.difficulty] || 180;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setError('');
    setSubmitting(true);
    setFeedback(null);
    clearTimer();
    try {
      let evaluation = await post('/interview/answer', {
        sessionId,
        questionId: currentQuestion.id,
        answer: answer.trim(),
      });
      if (hintUsed.has(currentQuestion.id)) {
        evaluation = { ...evaluation, score: Math.max(0, (evaluation.score || 0) - 1) };
      }
      setFeedback(evaluation);
      setAnsweredMap((prev) => ({
        ...prev,
        [currentQuestion.id]: { answer: answer.trim(), feedback: evaluation },
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    clearTimer();
    setSkippedIds((prev) => new Set(prev).add(currentQuestion.id));
    setAnswer('');
    setFeedback(null);
    setError('');
    setHintVisible(false);
    if (isLast) {
      setShowSkippedPrompt(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleTimeUp = () => {
    if (answer.trim()) {
      handleSubmitAnswer();
    } else {
      handleSkip();
    }
  };

  const handleShowHint = () => {
    setHintUsed((prev) => new Set(prev).add(currentQuestion.id));
    setHintVisible(true);
  };

  const handleNext = () => {
    clearTimer();
    setAnswer('');
    setFeedback(null);
    setError('');
    setHintVisible(false);
    if (isLast) {
      const stillSkipped = [...skippedIds].some((id) => !answeredMap[id]);
      if (stillSkipped) {
        setShowSkippedPrompt(true);
      } else {
        handleFinish();
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goToSkipped = () => {
    const firstSkipped = questions.findIndex((q) => skippedIds.has(q.id) && !answeredMap[q.id]);
    if (firstSkipped !== -1) {
      setShowSkippedPrompt(false);
      setCurrentIndex(firstSkipped);
    }
  };

  const finishAllSkipped = () => {
    setShowSkippedPrompt(false);
    handleFinish();
  };

  const handleFinish = async () => {
    setFinishing(true);
    setError('');
    try {
      const completedSession = await post('/interview/complete', { sessionId });
      sessionStorage.removeItem(`interview-state-${sessionId}`);
      sessionStorage.setItem(`results-${sessionId}`, JSON.stringify(completedSession));
      navigate(`/results/${sessionId}`);
    } catch (err) {
      setError(err.message);
      setFinishing(false);
    }
  };

  const navigateToQuestion = (index) => {
    const q = questions[index];
    if (answeredMap[q.id]) {
      setCurrentIndex(index);
      setFeedback(answeredMap[q.id].feedback);
      setAnswer(answeredMap[q.id].answer);
      clearTimer();
      setTimeLeft(null);
      setHintVisible(hintUsed.has(q.id));
    } else {
      setAnswer('');
      setFeedback(null);
      setError('');
      setHintVisible(false);
      setCurrentIndex(index);
    }
  };

  timeUpRef.current = handleTimeUp;

  const timerPercent = timeLeft != null ? (timeLeft / timerDuration) * 100 : 0;
  const timerColor = timerPercent > 50 ? 'from-emerald-500 to-teal-500' : timerPercent > 25 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-rose-500';

  const totalAnswered = Object.keys(answeredMap).length;
  const progressLabel = feedback
    ? `Question ${currentIndex + 1} of ${total}`
    : `${totalAnswered + skippedIds.size} of ${total} completed`;

  return (
    <div className="py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{progressLabel}</span>
              <div className="flex gap-1.5">
                {questions.map((q, i) => {
                  let dotColor = 'bg-gray-700';
                  if (answeredMap[q.id]) dotColor = 'bg-emerald-500';
                  else if (skippedIds.has(q.id) && !answeredMap[q.id]) dotColor = 'bg-red-500';
                  if (i === currentIndex) dotColor = 'bg-violet-500';
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigateToQuestion(i)}
                      className={`w-2.5 h-2.5 rounded-full ${dotColor} transition cursor-pointer hover:scale-125 ${i === currentIndex ? 'shadow-[0_0_8px_rgba(108,71,255,0.6)]' : ''}`}
                      title={`Question ${i + 1}${answeredMap[q.id] ? ' (answered)' : skippedIds.has(q.id) ? ' (skipped)' : ''}`}
                    />
                  );
                })}
              </div>
            </div>
            {timeLeft != null && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-1000`}
                    style={{ width: `${timerPercent}%` }}
                  />
                </div>
                <span className={`font-mono tabular-nums ${timeLeft <= 30 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-5 sm:p-8 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${categoryColor[currentQuestion.category] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
              {currentQuestion.category}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${difficultyColor[currentQuestion.difficulty] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
              {currentQuestion.difficulty}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
            {currentQuestion.question}
          </h2>

          {hintVisible && currentQuestion.hint && (
            <div className="mt-4 backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4">
              <p className="text-sm text-amber-300 leading-relaxed">
                <span className="font-medium">Hint: </span>
                {currentQuestion.hint}
              </p>
              <p className="text-xs text-amber-500/60 mt-1">-1 point for using hint</p>
            </div>
          )}
        </div>

        {/* Answer area */}
        {!feedback && (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Type your answer here..."
              className="w-full py-3 px-4 bg-black/20 border border-white/10 rounded-xl focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] focus:shadow-[0_0_20px_rgba(108,71,255,0.4)] text-white outline-none transition-all placeholder-gray-600 backdrop-blur-sm resize-none text-sm sm:text-base leading-relaxed"
            />

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-3 border border-red-500/20 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              {!hintVisible && currentQuestion.hint && (
                <button
                  onClick={handleShowHint}
                  className="py-3.5 px-5 rounded-xl backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold hover:bg-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer text-sm"
                >
                  Show Hint
                </button>
              )}
              <button
                onClick={handleSkip}
                className="py-3.5 px-5 rounded-xl backdrop-blur-sm bg-black/20 border border-white/10 text-gray-400 font-semibold hover:text-gray-200 hover:bg-white/10 transition-all hover:scale-[1.02] cursor-pointer text-sm"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || !answer.trim()}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-[0_0_20px_rgba(108,71,255,0.4)] hover:shadow-[0_0_30px_rgba(108,71,255,0.6)]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Evaluating...
                  </span>
                ) : (
                  'Submit Answer'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-5 sm:p-6 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-4">
                <div className={`text-3xl sm:text-4xl font-bold ${
                  feedback.score >= 8 ? 'text-emerald-400' :
                  feedback.score >= 5 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {feedback.score}
                  <span className="text-lg text-gray-600">/10</span>
                </div>
                <div className="text-sm text-gray-500">Score</div>
                {hintUsed.has(currentQuestion.id) && (
                  <span className="text-xs text-amber-500/70 ml-auto">Hint used (-1)</span>
                )}
              </div>

              {feedback.strengths?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Strengths
                  </h3>
                  <ul className="space-y-1">
                    {(Array.isArray(feedback.strengths) ? feedback.strengths : [feedback.strengths]).map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-500/50 before:rounded-full">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.improvements?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-1">
                    {(Array.isArray(feedback.improvements) ? feedback.improvements : [feedback.improvements]).map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-amber-500/50 before:rounded-full">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.idealAnswerHints && (
                <div className="backdrop-blur-sm bg-black/20 border border-white/5 rounded-xl p-3 sm:p-4">
                  <h3 className="text-sm font-medium text-cyan-400 mb-1">Ideal Answer Hints</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feedback.idealAnswerHints}</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-3 border border-red-500/20 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(108,71,255,0.4)] hover:shadow-[0_0_30px_rgba(108,71,255,0.6)]"
            >
              {isLast ? 'Review & Finish' : 'Next Question \u2192'}
            </button>
          </div>
        )}

        {/* Skipped prompt modal */}
        {showSkippedPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-6 sm:p-8 max-w-md w-full text-center space-y-5">
              <h3 className="text-xl font-bold text-white">Skipped Questions</h3>
              <p className="text-sm text-gray-400">
                You have {[...skippedIds].filter((id) => !answeredMap[id]).length} skipped question{(skippedIds.size - Object.keys(answeredMap).filter(id => skippedIds.has(id)).length) > 1 ? 's' : ''} remaining.
              </p>
              <p className="text-sm text-gray-500">Would you like to review them or finish now?</p>
              <div className="flex gap-3">
                <button onClick={goToSkipped} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-semibold transition-all hover:scale-[1.02] cursor-pointer">
                  Review Skipped
                </button>
                <button onClick={finishAllSkipped} className="flex-1 py-3 rounded-xl backdrop-blur-sm bg-black/20 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 transition-all hover:scale-[1.02] cursor-pointer">
                  Finish (Skip scores 0)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}