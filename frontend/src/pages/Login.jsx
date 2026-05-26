import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Mail, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      const res = await login(email, password);
      if (res.success) {
        setSuccessMsg('Authentication successful! Logging in...');
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Login component error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 mt-8">
        <div className="w-full max-w-md glass-card rounded-2xl border border-[rgba(0,240,255,0.15)] bg-slate-950/70 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          
          {/* Logo Accents */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-cyan-950 border border-cyan-500/30 rounded-2xl w-fit mb-3">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold tracking-widest text-slate-100 uppercase tech-mono">
              PORTAL <span className="text-cyan-400">// SIGNIN</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Access your AI recruitment space</p>
          </div>

          {/* Validation Indicators */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-400 text-xs mb-6 tech-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs mb-6 tech-mono">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 tech-mono">EMAIL ADDRESS</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g., candidate@smartedu.com"
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 pl-11 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 tech-mono">PASSWORD</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 pl-11 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-800 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              {isLoading ? "AUTHORIZING_IDENTITY..." : "SIGN IN"}
            </button>

          </form>

          {/* Footer Router link */}
          <div className="text-center mt-6 text-xs text-slate-500">
            Don't have a portal account yet?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Create an account
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
            <span className="text-[9px] tech-mono text-slate-600 uppercase tracking-widest">
              ADMIN SIGNUP: Use mail containing 'admin'
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
