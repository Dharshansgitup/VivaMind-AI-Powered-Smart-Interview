import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Shield, Sparkles, Terminal, Activity, Award } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      {/* Hero Section */}
      <div className="flex-1 max-w-6xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-12 md:mt-20">
        
        {/* Glow Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6 animate-cyber-pulse shadow-[0_0_15px_rgba(0,240,255,0.15)] select-none">
          <Sparkles className="w-3.5 h-3.5" /> RECRUITMENT DRIVEN BY MACHINE INTELLIGENCE
        </div>

        <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight uppercase mb-6">
          THE FUTURE OF <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 neon-text-cyan">
            SMART INTERVIEWS
          </span>
        </h1>

        <p className="max-w-2xl text-slate-400 text-base md:text-xl leading-relaxed mb-10">
          AURORA simulates enterprise-grade technical and HR interviews using advanced conversational AI. Stream voice, track biometrics real-time, compile code in sandboxes, and hire with confidence.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-20">
          <Link 
            to="/register" 
            className="px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold rounded-2xl transition duration-300 text-base uppercase tracking-wider neon-glow-cyan shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:scale-105"
          >
            Start Assessment Free
          </Link>
          <Link 
            to="/login" 
            className="px-8 py-4 border border-slate-800 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-400 font-bold rounded-2xl transition duration-300 text-base uppercase tracking-wider hover:scale-105"
          >
            Candidate Portal
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          
          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl transition-all group-hover:bg-cyan-500/10" />
            <div className="p-3 bg-cyan-950 border border-cyan-500/20 rounded-xl w-fit">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 tech-mono uppercase">AI Bot Interviewer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engage in fluent conversations. Gemini generates dynamically tailored follow-ups based on candidate resumes and custom answers.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-xl transition-all group-hover:bg-purple-500/10" />
            <div className="p-3 bg-purple-950 border border-purple-500/20 rounded-xl w-fit">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 tech-mono uppercase">Biometrics Canvas HUD</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time eye-tracking, wireframe facial mesh mapping, blink detection, and voice stress telemetry logged frame-by-frame.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl transition-all group-hover:bg-emerald-500/10" />
            <div className="p-3 bg-emerald-950 border border-emerald-500/20 rounded-xl w-fit">
              <Terminal className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 tech-mono uppercase">Sandboxed Code VM</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Compile JavaScript securely in standard sandboxes, execute test suites, analyze complexity, and score performance metrics.
            </p>
          </div>

        </div>

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent w-full my-20" />

        {/* Security / Proctorship Callout */}
        <div className="glass-card p-8 rounded-3xl w-full flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="flex items-center gap-4 text-left">
            <div className="p-4 rounded-full bg-cyan-950/50 border border-cyan-500/20">
              <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-200 uppercase tech-mono">AI Proctorship & Anti-Cheating</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Monitors page visibility focus, browser tab switches, and multi-face anomalies, automatically logging incident records to enforce integrity.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold tech-mono text-emerald-400 uppercase tracking-widest">
            <Award className="w-4 h-4 text-emerald-400 animate-bounce" /> 100% PROCTOR_SECURE
          </div>
        </div>

      </div>
    </div>
  );
}
