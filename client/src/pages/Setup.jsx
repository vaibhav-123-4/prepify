import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../utils/api';

const EXPERIENCE_LEVELS = ['Fresher', '1-3 years', '3+ years'];
const QUESTION_COUNTS = [3, 5, 7, 10];

export default function Setup() {
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!role.trim()) {
      setError('Please enter a role');
      return;
    }
    if (!experienceLevel) {
      setError('Please select an experience level');
      return;
    }

    setLoading(true);
    try {
      const data = await post('/interview/start', {
        role: role.trim(),
        experienceLevel,
        jobDescription: jobDescription.trim() || undefined,
        questionCount,
      });
      sessionStorage.setItem(`interview-${data.sessionId}`, JSON.stringify(data.questions));
      navigate(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Interview Setup</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Configure your mock interview session</p>
        </div>

        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-5 sm:p-8 space-y-5 sm:space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-3 border border-red-500/20 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full py-3 px-4 bg-black/20 border border-white/10 rounded-xl focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] focus:shadow-[0_0_20px_rgba(108,71,255,0.4)] text-white outline-none transition-all placeholder-gray-600 backdrop-blur-sm"
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Experience Level</label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <label
                  key={level}
                  className={`flex-1 text-center cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-medium transition backdrop-blur-sm ${
                    experienceLevel === level
                      ? 'bg-[#6C47FF]/20 border-[#6C47FF]/50 text-[#6C47FF] shadow-[0_0_15px_rgba(108,71,255,0.3)]'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level}
                    checked={experienceLevel === level}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="sr-only"
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Number of Questions</label>
            <div className="flex gap-2 sm:gap-3">
              {QUESTION_COUNTS.map((count) => (
                <label
                  key={count}
                  className={`flex-1 text-center cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition backdrop-blur-sm ${
                    questionCount === count
                      ? 'bg-[#6C47FF]/20 border-[#6C47FF]/50 text-[#6C47FF] shadow-[0_0_15px_rgba(108,71,255,0.3)]'
                      : 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="questionCount"
                    value={count}
                    checked={questionCount === count}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="sr-only"
                  />
                  {count}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">
              Job Description <span className="text-gray-600">(optional)</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="w-full py-3 px-4 bg-black/20 border border-white/10 rounded-xl focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] focus:shadow-[0_0_20px_rgba(108,71,255,0.4)] text-white outline-none transition-all placeholder-gray-600 backdrop-blur-sm resize-none"
              placeholder="Paste the job description to get tailored questions..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-[0_0_20px_rgba(108,71,255,0.4)] hover:shadow-[0_0_30px_rgba(108,71,255,0.6)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Questions...
              </span>
            ) : (
              'Start Interview'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
