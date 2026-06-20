import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Setup from './pages/Setup';
import Interview from './pages/Interview';
import Results from './pages/Results';
import History from './pages/History';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <Spinner text="Authenticating..." />
      </div>
    );
  }
  if (!user || !localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117]">
        <Spinner text="Loading..." />
      </div>
    );
  }
  return !user ? children : <Navigate to="/setup" replace />;
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0D1117] flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#6C47FF] rounded-full blur-[120px] opacity-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan-600 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

      {/* Geometric Shapes */}
      <div className="fixed top-20 left-[10%] border-b-[40px] border-r-[40px] border-transparent border-b-cyan-400 opacity-20 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-24 right-[10%] border-t-[25px] border-l-[25px] border-transparent border-t-purple-400 opacity-20 drop-shadow-[0_0_15px_rgba(192,132,252,0.4)] animate-pulse pointer-events-none"></div>

      <Navbar />
      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Landing page — public, shown to everyone */}
      <Route path="/" element={<Landing />} />

      {/* Guest routes */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected routes with navbar */}
      <Route path="/setup" element={
        <ProtectedRoute><AuthLayout><Setup /></AuthLayout></ProtectedRoute>
      } />
      <Route path="/interview/:sessionId" element={
        <ProtectedRoute><AuthLayout><Interview /></AuthLayout></ProtectedRoute>
      } />
      <Route path="/results/:sessionId" element={
        <ProtectedRoute><AuthLayout><Results /></AuthLayout></ProtectedRoute>
      } />
      <Route path="/history" element={
        <ProtectedRoute><AuthLayout><History /></AuthLayout></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
