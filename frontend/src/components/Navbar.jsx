import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, LogOut, User as UserIcon, Settings, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card px-6 py-4 mx-4 my-3 rounded-2xl flex items-center justify-between border-b border-[rgba(0,240,255,0.15)] bg-slate-950/65 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-300">
            <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-wider text-slate-100 uppercase tech-mono">
            AURA <span className="text-cyan-400 font-extrabold neon-text-cyan">// SMART INTERVIEW</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
              {user.role === 'admin' ? (
                <Shield className="w-4 h-4 text-purple-400" />
              ) : (
                <UserIcon className="w-4 h-4 text-cyan-400" />
              )}
              <span className="text-sm font-medium text-slate-300">{user.name}</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md ${
                user.role === 'admin' 
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-800' 
                  : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
              }`}>
                {user.role}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 rounded-xl transition-all bg-slate-900/40 hover:bg-slate-900"
              >
                Dashboard
              </Link>
              
              <Link 
                to="/profile" 
                className="p-2 rounded-xl border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 bg-slate-900/40 transition-all"
                title="Profile Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl border border-slate-800 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 bg-slate-900/40 hover:bg-rose-950/20 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-300 hover:text-cyan-400 px-3 py-2 transition-all"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 text-sm font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all duration-300 neon-glow-cyan"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
