import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/api';
import Spinner from '../components/Spinner';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await get('/interview/sessions');
        setSessions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) {
    return <Spinner text="Loading history..." />;
  }

  return (
    <div className="py-6 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Interview History</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => navigate('/setup')}
            className="py-2.5 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(108,71,255,0.4)] hover:shadow-[0_0_30px_rgba(108,71,255,0.6)]"
          >
            New Interview
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-3 mb-6 border border-red-500/20 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {sessions.length === 0 && !error ? (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 sm:p-12 text-center">
            <p className="text-gray-500">No interviews yet.</p>
            <button
              onClick={() => navigate('/setup')}
              className="mt-4 text-[#6C47FF] hover:text-white text-sm transition drop-shadow-[0_0_8px_rgba(108,71,255,0.4)]"
            >
              Start your first interview →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const score = s.overallScore;
              const scoreColor = score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : score != null ? 'text-red-400' : 'text-gray-600';
              const date = new Date(s.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={s.sessionId}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-4 sm:p-5 flex items-center justify-between hover:bg-white/10 transition cursor-pointer"
                  onClick={() => navigate(`/results/${s.sessionId}`)}
                >
                  <div className="min-w-0 mr-3">
                    <h3 className="text-white font-medium truncate text-sm sm:text-base">{s.role}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                      <span className="text-xs text-gray-500">{s.experienceLevel}</span>
                      <span className="text-gray-700 hidden sm:inline">·</span>
                      <span className="text-xs text-gray-500">{date}</span>
                      {s.completedAt ? (
                        <span className="text-xs text-emerald-500/70">Completed</span>
                      ) : (
                        <span className="text-xs text-amber-500/70">In Progress</span>
                      )}
                    </div>
                  </div>

                  <div className={`text-xl sm:text-2xl font-bold shrink-0 ${scoreColor}`}>
                    {score != null ? score : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
