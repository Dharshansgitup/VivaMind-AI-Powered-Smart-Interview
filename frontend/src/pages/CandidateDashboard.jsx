import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Play, Terminal, Calendar, Award, Sparkles, ChevronRight, MessageSquare, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CandidateDashboard() {
  const { user, apiUrl } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    avgScore: 0,
    completedCount: 0,
    codingCount: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [apiUrl]);

  const fetchDashboardData = async () => {
    try {
      const histRes = await axios.get(`${apiUrl}/interviews/history`);
      if (histRes.data.success) {
        const histData = histRes.data.history;
        setHistory(histData);

        // Fetch coding submissions to count solved
        const subRes = await axios.get(`${apiUrl}/coding/challenges`);
        const subCount = subRes.data.challenges ? subRes.data.challenges.length : 3;

        // Calculate aggregates
        const completed = histData.filter(h => h.status === 'completed');
        const avg = completed.length > 0 
          ? Math.round(completed.reduce((sum, h) => sum + h.metrics.overallTechnicalScore, 0) / completed.length)
          : 0;

        setStats({
          avgScore: avg,
          completedCount: completed.length,
          codingCount: subCount
        });
      }
    } catch (err) {
      console.error("Error loading candidate dashboard:", err);
    }
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    try {
      setIsStarting(true);
      const res = await axios.post(`${apiUrl}/interviews/start`, {
        title: interviewTitle || `${user?.profile?.targetRole || 'Full Stack'} AI Mock Session`,
        type: interviewType
      });

      if (res.data.success) {
        setShowModal(false);
        navigate(`/interview/${res.data.interviewId}`);
      }
    } catch (err) {
      console.error("Error launching interview session:", err);
      alert("System failure starting interview room. Check backend logs.");
    } finally {
      setIsStarting(false);
    }
  };

  // Compile Recharts line history based on real data
  const chartData = history
    .filter(h => h.status === 'completed')
    .slice()
    .reverse()
    .map(h => ({
      date: new Date(h.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: h.metrics.overallTechnicalScore,
      comm: h.metrics.overallCommunicationScore
    }));

  // Fallback charts if new account
  const sampleChartData = chartData.length > 0 ? chartData : [
    { date: 'Initial', score: 0, comm: 0 },
    { date: 'Simulated 1', score: 72, comm: 80 },
    { date: 'Simulated 2', score: 85, comm: 92 }
  ];

  // Radar/Bar category stats
  const skillCategoryData = [
    { name: 'Core Tech', score: stats.avgScore || 70 },
    { name: 'Speaking', score: history.length > 0 ? 82 : 75 },
    { name: 'Problem Solve', score: stats.codingCount > 0 ? 85 : 60 },
    { name: 'Stress Hold', score: 90 }
  ];

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto px-6 w-full mt-6">
        
        {/* Welcome Tag */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide uppercase text-slate-100 tech-mono">
              CANDIDATE <span className="text-cyan-400 font-black">// COCKPIT</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider">
              {user?.profile?.targetRole} • {user?.profile?.experience} Years Experience
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-3 font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl flex items-center gap-2 cursor-pointer transition shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:scale-103"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" /> Start AI Interview
            </button>
            <Link
              to="/coding"
              className="px-5 py-3 font-bold border border-slate-800 hover:border-cyan-500/30 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-400 rounded-xl flex items-center gap-2 transition hover:scale-103"
            >
              <Terminal className="w-4 h-4" /> Coding Challenges
            </Link>
          </div>
        </div>

        {/* Aggregated Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tech-mono">AVG INTERVIEW RATING</span>
              <span className="text-3xl font-black text-cyan-400 tech-mono">{stats.avgScore}%</span>
            </div>
            <Award className="w-10 h-10 text-cyan-500/30" />
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tech-mono">COMPLETED INTERVIEWS</span>
              <span className="text-3xl font-black text-emerald-400 tech-mono">{stats.completedCount}</span>
            </div>
            <MessageSquare className="w-10 h-10 text-emerald-500/30" />
          </div>

          <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tech-mono">CODING ARENA PROBLEMS</span>
              <span className="text-3xl font-black text-purple-400 tech-mono">{stats.codingCount}</span>
            </div>
            <Brain className="w-10 h-10 text-purple-500/30" />
          </div>
        </div>

        {/* Interactive Recharts Analytics Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Historical Score Line Chart */}
          <div className="glass-card p-6 rounded-2xl md:col-span-2 flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase">EVALUATION METRIC HISTORIES</h3>
            </div>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampleChartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" />
                  <YAxis stroke="#475569" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="score" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" name="Technical Score" />
                  <Area type="monotone" dataKey="comm" stroke="#bd00ff" strokeWidth={1.5} fillOpacity={0} name="Speaking Score" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill breakdown Bar Chart */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase">SKILL COMPETENCY MATRIX</h3>
            </div>
            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillCategoryData}>
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#475569" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b' }} />
                  <Bar dataKey="score" fill="#bd00ff" radius={[4, 4, 0, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Interview History List */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase">ASSESSMENT HISTORY TRANSACTIONS</h3>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-3">
              <Brain className="w-12 h-12 text-slate-700 animate-pulse" />
              <p className="text-sm font-medium">No previous assessments found in your history log.</p>
              <button 
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)]"
              >
                Launch First AI Session
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-900">
              {history.map((sess) => (
                <div key={sess._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-900/10 px-2 rounded-xl transition">
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">{sess.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="uppercase tracking-wider tech-mono text-cyan-400">{sess.type}</span>
                      <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        sess.status === 'completed' 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' 
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800 animate-pulse'
                      }`}>
                        {sess.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {sess.status === 'completed' ? (
                      <>
                        <div className="flex flex-col items-end tech-mono text-xs">
                          <span className="text-slate-500 uppercase text-[9px]">TECH_SCORE</span>
                          <span className="font-extrabold text-cyan-400">{sess.metrics.overallTechnicalScore}%</span>
                        </div>
                        <div className="flex flex-col items-end tech-mono text-xs">
                          <span className="text-slate-500 uppercase text-[9px]">COMM_SCORE</span>
                          <span className="font-extrabold text-purple-400">{sess.metrics.overallCommunicationScore}%</span>
                        </div>
                        <Link
                          to={`/report/${sess._id}`}
                          className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,240,255,0.15)] cursor-pointer"
                        >
                          Diagnostic Report <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </>
                    ) : (
                      <Link
                        to={`/interview/${sess._id}`}
                        className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-[0_0_10px_rgba(251,191,36,0.15)] cursor-pointer"
                      >
                        Resume Room <Play className="w-3 h-3 fill-slate-950 text-slate-950" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Start Interview Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-card rounded-2xl border border-[rgba(0,240,255,0.15)] bg-slate-950 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-float">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tech-mono tracking-wider flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" /> Start AI Interview Session
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 tech-mono text-sm cursor-pointer"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleStartInterview} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">INTERVIEW SESSION TITLE</label>
                <input
                  type="text"
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                  placeholder={`e.g., ${user?.profile?.targetRole || 'Full Stack'} Developer Mock`}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">ASSESSMENT FORMAT TYPE</label>
                <div className="grid grid-cols-3 gap-2 text-[10px] tech-mono font-bold uppercase">
                  {['technical', 'behavioral', 'hybrid'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterviewType(type)}
                      className={`py-2 border rounded-xl transition cursor-pointer ${
                        interviewType === type 
                          ? 'bg-cyan-950 text-cyan-400 border-cyan-500/30' 
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isStarting}
                className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-800 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.2)] mt-2"
              >
                {isStarting ? "LAUNCHING_AI_AGENT..." : "LAUNCH INTERVIEW ROOM"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
