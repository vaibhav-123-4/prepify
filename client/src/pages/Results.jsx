import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get } from '../utils/api';
import Spinner from '../components/Spinner';
import CategoryBreakdown from '../components/CategoryBreakdown';
import { generateInterviewReport } from '../utils/generateReport';

export default function Results() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDownloadReport = async () => {
    setDownloading(true);
    setSuccessMessage('');
    setError('');
    try {
      // Small delay to ensure the loading state displays nicely to the user
      await new Promise((resolve) => setTimeout(resolve, 1000));
      generateInterviewReport(session);
      setSuccessMessage('Report downloaded!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to generate PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(`results-${sessionId}`);
    if (stored) {
      setSession(JSON.parse(stored));
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const data = await get(`/interview/session/${sessionId}`);
        setSession(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return <Spinner text="Loading results..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-6 py-4 mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            {error}
          </div>
          <button onClick={() => navigate('/history')} className="text-[#6C47FF] hover:text-white text-sm transition drop-shadow-[0_0_8px_rgba(108,71,255,0.4)]">
            View History →
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 sm:p-12">
          <p className="text-gray-400">Session data not found.</p>
          <button onClick={() => navigate('/history')} className="mt-4 text-[#6C47FF] hover:text-white transition drop-shadow-[0_0_8px_rgba(108,71,255,0.4)]">
            View History →
          </button>
        </div>
      </div>
    );
  }

  const score = session.overallScore ?? 0;
  const scoreColor = score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = score >= 7 ? 'bg-emerald-500/10 border-emerald-500/20' : score >= 5 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Interview Complete</h1>
          <p className="text-gray-500 text-sm sm:text-base">{session.role} · {session.experienceLevel}</p>
        </div>

        {/* Score card */}
        <div className={`backdrop-blur-xl border shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-6 sm:p-8 text-center mb-6 sm:mb-8 ${scoreBg}`}>
          <div className={`text-5xl sm:text-7xl font-bold ${scoreColor}`}>
            {score}
          </div>
          <div className="text-gray-400 mt-2 text-xs sm:text-sm">Overall Score out of 10</div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-500/10 text-emerald-400 text-sm rounded-lg px-6 py-4 mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-center">
            {successMessage}
          </div>
        )}

        {/* Action buttons (moved near the top, next to Score card) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/setup')}
            className="flex-grow py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(108,71,255,0.4)] hover:shadow-[0_0_30px_rgba(108,71,255,0.6)] text-center text-sm"
          >
            Start New Interview
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="flex-grow py-3.5 rounded-xl backdrop-blur-sm bg-[#8B5CF6]/10 border border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/20 text-[#D8B4FE] font-semibold transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <span>📥</span>
            {downloading ? 'Generating...' : 'Download Report'}
          </button>
          <button
            onClick={() => navigate('/history')}
            className="flex-grow py-3.5 rounded-xl backdrop-blur-sm bg-black/20 border border-white/10 hover:bg-white/10 text-gray-300 font-semibold transition-all hover:scale-[1.02] cursor-pointer text-center text-sm"
          >
            View History
          </button>
        </div>

        {/* Category Breakdown */}
        {session.categoryScores && session.categoryScores.length > 1 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Performance by Category</h2>
            <CategoryBreakdown categoryScores={session.categoryScores} />
          </div>
        )}

        {/* Questions & Answers */}
        <div className="space-y-3 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Question Breakdown</h2>

          {session.questions?.map((q, i) => {
            const ans = session.answers?.find((a) => a.questionId === q.id);
            const isExpanded = expandedIndex === i;

            return (
              <div key={q.id} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden">
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-lg font-bold shrink-0 ${
                      ans?.score >= 7 ? 'text-emerald-400' :
                      ans?.score >= 5 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {ans?.score ?? '—'}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-300 truncate">{q.question}</span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 shrink-0 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && ans && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1 border-t border-white/10 space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Your Answer</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{ans.answer}</p>
                    </div>

                    {ans.strengths && (
                      <div>
                        <h4 className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Strengths</h4>
                        <p className="text-sm text-gray-400">{Array.isArray(ans.strengths) ? ans.strengths.join(', ') : ans.strengths}</p>
                      </div>
                    )}

                    {ans.improvements && (
                      <div>
                        <h4 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-1">Improvements</h4>
                        <p className="text-sm text-gray-400">{Array.isArray(ans.improvements) ? ans.improvements.join(', ') : ans.improvements}</p>
                      </div>
                    )}

                    {ans.idealAnswerHints && (
                      <div className="backdrop-blur-sm bg-black/20 border border-white/5 rounded-xl p-3">
                        <h4 className="text-xs font-medium text-cyan-400 uppercase tracking-wider mb-1">💡 Ideal Answer</h4>
                        <p className="text-sm text-gray-400">{ans.idealAnswerHints}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Spacing bottom */}
        <div className="pt-2" />
      </div>
    </div>
  );
}
