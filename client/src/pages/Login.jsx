import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate('/setup');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-[#0D1117] text-white items-center justify-center relative overflow-hidden py-10 px-4">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#6C47FF] rounded-full blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-pink-600 rounded-full blur-[120px] opacity-20"></div>

      {/* Geometric Shapes */}
      <div className="absolute top-20 left-[10%] border-b-[40px] border-r-[40px] border-transparent border-b-cyan-400 opacity-40 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse"></div>
      <div className="absolute top-32 right-[15%] border-t-[30px] border-l-[30px] border-transparent border-t-yellow-400 opacity-30 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]"></div>
      <div className="absolute bottom-40 left-[20%] border-b-[35px] border-r-[35px] border-transparent border-b-pink-500 opacity-40 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]"></div>
      <div className="absolute bottom-24 right-[10%] border-t-[25px] border-l-[25px] border-transparent border-t-purple-400 opacity-30 drop-shadow-[0_0_15px_rgba(192,132,252,0.4)] animate-pulse"></div>

      <div className="absolute top-1/4 right-1/4 text-6xl opacity-20 blur-sm pointer-events-none -rotate-12">🚀</div>

      {/* Center Glass Box */}
      <div className="max-w-[420px] w-full relative z-10 mt-8">
        {/* Logo outside the box, centered */}
        <div className="flex items-center justify-center gap-2 mb-8 drop-shadow-[0_0_10px_rgba(108,71,255,0.6)]">
          <span className="text-3xl"></span>
          <span className="text-[#6C47FF] font-bold text-2xl tracking-tight">Prepify</span>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 sm:p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-sm text-gray-400">Sign in to your account and continue your prep.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm rounded-lg px-4 py-3 border border-red-500/20 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full py-3 px-4 bg-black/20 border border-white/10 rounded-xl focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] focus:shadow-[0_0_20px_rgba(108,71,255,0.4)] text-white outline-none transition-all placeholder-gray-600 backdrop-blur-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-3 px-4 bg-black/20 border border-white/10 rounded-xl focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] focus:shadow-[0_0_20px_rgba(108,71,255,0.4)] text-white outline-none transition-all placeholder-gray-600 backdrop-blur-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-[0_0_20px_rgba(108,71,255,0.4)] hover:shadow-[0_0_30px_rgba(108,71,255,0.6)]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center mt-6 text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#6C47FF] font-medium hover:text-white transition-colors drop-shadow-[0_0_8px_rgba(108,71,255,0.4)]">
                Register
              </Link>
            </p>
          </form>
        </div>
        
        {/* Footer features */}
        <div className="mt-12 flex justify-center gap-6 text-[11px] text-gray-500 font-medium tracking-wider uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
          <span>✦ AI Questions</span>
          <span>✦ Instant Feedback</span>
          <span>✦ Track Progress</span>
        </div>
      </div>
    </div>
  );
}

