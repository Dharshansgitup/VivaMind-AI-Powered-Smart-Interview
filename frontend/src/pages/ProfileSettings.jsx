import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cpu, FileText, Sparkles, CheckCircle2, User as UserIcon, Briefcase, Award, ShieldAlert } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function ProfileSettings() {
  const { user, updateProfile, uploadAndParseResume, loading } = useAuth();

  // Profile Form States
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [experience, setExperience] = useState(0);
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  // Resume Paste State
  const [resumeText, setResumeText] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Sync user profile when loaded
  useEffect(() => {
    if (user && user.profile) {
      setName(user.name || '');
      setTargetRole(user.profile.targetRole || 'Full Stack Engineer');
      setExperience(user.profile.experience || 0);
      setSkills(user.profile.skills ? user.profile.skills.join(', ') : '');
      setBio(user.profile.bio || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    const res = await updateProfile({
      name,
      skills,
      experience,
      targetRole,
      bio
    });

    if (res.success) {
      setMsg({ text: 'Telemetry profile updated successfully!', type: 'success' });
    } else {
      setMsg({ text: res.message, type: 'error' });
    }
  };

  const handleResumeParse = async () => {
    if (!resumeText.trim()) return;
    setMsg({ text: '', type: '' });

    const res = await uploadAndParseResume(resumeText);
    if (res.success) {
      setMsg({ 
        text: `Resume compiled successfully! Auto-filled target role: "${res.parsedData.targetRole}" and extracted ${res.parsedData.skills.length} core skills.`,
        type: 'success' 
      });
      setResumeText('');
    } else {
      setMsg({ text: res.message, type: 'error' });
    }
  };

  const rolesList = [
    'Full Stack Engineer', 'Frontend Engineer', 'Backend Engineer', 'Data Scientist',
    'Machine Learning Engineer', 'DevOps Engineer', 'UI/UX Designer', 'Product Manager'
  ];

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto px-6 w-full mt-6">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-wide uppercase text-slate-100 tech-mono">
            PROFILE <span className="text-cyan-400 font-black">// CONFIGURATIONS</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider">
            Compile candidate credentials • Sync resumes to neural profiles
          </p>
        </div>

        {/* Global Action Messages */}
        {msg.text && (
          <div className={`flex items-center gap-3 p-4 rounded-xl text-xs font-semibold tech-mono mb-6 border ${
            msg.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
              : 'bg-rose-950/40 border-rose-800/40 text-rose-400'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* 2 Column Settings Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Column 1: Manual Profile Editor */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-5 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-cyan-400" /> EDIT NEURAL PROFILE DATA
            </h3>

            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-xs">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">FULL NAME</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 pl-10 text-slate-200 focus:outline-none"
                  />
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">TARGET JOB ROLE</label>
                  <div className="relative">
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-slate-200 focus:outline-none"
                    >
                      {rolesList.map(r => <option key={r} value={r} className="bg-slate-950 text-slate-300">{r}</option>)}
                    </select>
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">EXPERIENCE (YEARS)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-slate-200 focus:outline-none"
                    />
                    <Award className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">PRIMARY SKILLS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., React, Node, SQL, AWS"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">PROFILE BIO STATEMENT</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-800 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)] mt-2"
              >
                {loading ? "SAVING_PROFILE_DATA..." : "SYNC NEURAL CONFIG"}
              </button>

            </form>
          </div>

          {/* Column 2: Resume Parser Uploader */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> AI RESUME TEXT PARSER
            </h3>

            <div className="flex flex-col gap-4 text-xs h-full justify-between">
              
              <div className="flex flex-col gap-1.5">
                <p className="text-slate-400 leading-relaxed mb-3">
                  Paste your text resume or work achievements in the space below. AURA scans for experience spikes, matching skills parameters, and auto-updates your entire profile automatically!
                </p>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  disabled={loading}
                  rows={8}
                  placeholder="Paste your plain text resume content here... (Include experiences like '5 years of experience in React and Node.js')"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none resize-none placeholder-slate-600 font-medium"
                />
              </div>

              <button
                onClick={handleResumeParse}
                disabled={loading || !resumeText.trim()}
                className="w-full py-3.5 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition duration-300 cursor-pointer shadow-[0_0_15px_rgba(189,0,255,0.2)] mt-4"
              >
                {loading ? "PARSING_RESUME_PARAMETERS..." : "PARSE RESUME & SYNC PROFILE"}
              </button>

              <div className="mt-4 border-t border-slate-900 pt-4 text-[10px] text-slate-500 tech-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>INTELLIGENT PARSER: RESOLVES SKILLS & EXPERIENCE AUTOMATICALLY</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
