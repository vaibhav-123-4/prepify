import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span
            onClick={() => navigate('/setup')}
            className="text-lg font-bold bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] bg-clip-text text-transparent cursor-pointer"
          >
            ⚡ Prepify
          </span>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => navigate('/setup')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition cursor-pointer ${
                isActive('/setup')
                  ? 'bg-[#6C47FF]/20 text-[#6C47FF] shadow-[0_0_15px_rgba(108,71,255,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
              }`}
            >
              New
            </button>
            <button
              onClick={() => navigate('/history')}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition cursor-pointer ${
                isActive('/history')
                  ? 'bg-[#6C47FF]/20 text-[#6C47FF] shadow-[0_0_15px_rgba(108,71,255,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/10'
              }`}
            >
              History
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline truncate max-w-[180px]">
            {user.username}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-400 transition px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
