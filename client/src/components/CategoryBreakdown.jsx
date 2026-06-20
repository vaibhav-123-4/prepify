import { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell,
} from 'recharts';

const scoreColor = (score) =>
  score >= 7 ? '#22C55E' : score >= 5 ? '#F59E0B' : '#EF4444';

const scoreTextClass = (score) =>
  score >= 7 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';

const scoreBgClass = (score) =>
  score >= 7
    ? 'bg-emerald-500/15 border-emerald-500/25'
    : score >= 5
    ? 'bg-amber-500/15 border-amber-500/25'
    : 'bg-red-500/15 border-red-500/25';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
        color: '#F8FAFC',
      }}
    >
      <p className="text-sm font-medium">{d.category}</p>
      <p className="text-xs mt-1" style={{ color: scoreColor(d.averageScore) }}>
        Score: {d.averageScore}/10
      </p>
      <p className="text-xs text-gray-400">{d.questionCount} question{d.questionCount > 1 ? 's' : ''}</p>
    </div>
  );
};

export default function CategoryBreakdown({ categoryScores }) {
  const [view, setView] = useState('radar');

  if (!categoryScores || categoryScores.length === 0) return null;

  // Map data for radar chart (needs "subject" + "score")
  const radarData = categoryScores.map((c) => ({
    subject: c.category,
    score: c.averageScore,
    fullMark: 10,
    ...c,
  }));

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('radar')}
          className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
            view === 'radar'
              ? 'bg-[#6C47FF]/20 border-[#6C47FF]/50 text-[#6C47FF] shadow-[0_0_12px_rgba(108,71,255,0.2)]'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
          }`}
        >
          Radar View
        </button>
        <button
          onClick={() => setView('bar')}
          className={`text-xs px-3 py-1.5 rounded-full border transition cursor-pointer ${
            view === 'bar'
              ? 'bg-[#6C47FF]/20 border-[#6C47FF]/50 text-[#6C47FF] shadow-[0_0_12px_rgba(108,71,255,0.2)]'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
          }`}
        >
          Bar View
        </button>
      </div>

      {/* Chart */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-4 sm:p-6">
        {view === 'radar' ? (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
                dot={{ r: 4, fill: '#8B5CF6', stroke: '#8B5CF6' }}
                domain={[0, 10]}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={categoryScores}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <XAxis
                dataKey="category"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="averageScore" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {categoryScores.map((entry, index) => (
                  <Cell key={index} fill={scoreColor(entry.averageScore)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-3">
        {categoryScores.map((c) => (
          <div
            key={c.category}
            className={`backdrop-blur-xl border rounded-xl p-3 sm:p-4 ${scoreBgClass(c.averageScore)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white truncate mr-2">{c.category}</span>
              <span className={`text-lg font-bold shrink-0 ${scoreTextClass(c.averageScore)}`}>
                {c.averageScore}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {c.questionCount} question{c.questionCount > 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
