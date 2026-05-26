import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Mail, Lock, User as UserIcon, Briefcase, Award, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Register() {
  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [experience, setExperience] = useState('2');
  const [skills, setSkills] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setIsLoading(true);
      const res = await signup({
        name,
        email,
        password,
        targetRole,
        experience,
        skills
      });
      if (res.success) {
        setTimeout(() => {
          if (res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 800);
      }
    } catch (err) {
      console.error("Signup component error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const rolesList = [
    'Full Stack Engineer', 'Frontend Engineer', 'Backend Engineer', 'Data Scientist',
    'Machine Learning Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Product Manager'
  ];

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 mt-8">
        <div className="w-full max-w-lg glass-card rounded-2xl border border-[rgba(0,240,255,0.15)] bg-slate-950/70 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-cyan-950 border border-cyan-500/30 rounded-2xl w-fit mb-3">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold tracking-widest text-slate-100 uppercase tech-mono">
              PORTAL <span className="text-cyan-400">// REGISTER</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Initialize candidate assessment environment</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-400 text-xs mb-5 tech-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 tech-mono">FULL NAME</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g., Alex Johnson"
                    className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  />
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 tech-mono">EMAIL ADDRESS</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="alex@smartedu.com"
                    className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
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
                  className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 tech-mono">TARGET JOB ROLE</label>
                <div className="relative">
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 focus:outline-none transition-all"
                  >
                    {rolesList.map(r => <option key={r} value={r} className="bg-slate-950 text-slate-300">{r}</option>)}
                  </select>
                  <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 tech-mono">EXPERIENCE (YEARS)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 focus:outline-none transition-all"
                  />
                  <Award className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 tech-mono">PRIMARY SKILLS (COMMA SEPARATED)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., React, Node.js, Express, JavaScript, MongoDB, Tailwind"
                className="w-full bg-slate-900/60 border border-slate-800 hover:border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-800 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)] mt-2"
            >
              {isLoading ? "INITIALIZING ENVIRONMENT..." : "CREATE ACCOUNT"}
            </button>

          </form>

          <div className="text-center mt-6 text-xs text-slate-500">
            Already have a portal account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline">
              Sign In here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
