import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Shield, Users, Calendar, AlertOctagon, Plus, CheckCircle2, XCircle, Search, Award } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const { user, apiUrl } = useAuth();
  
  const [candidates, setCandidates] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalCandidates: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    averageTechnicalScore: 0,
    averageCommunicationScore: 0,
    averageCodingScore: 0,
    totalCheatingAlerts: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'sessions', 'addquestion'
  
  // Question Form States
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDesc, setQuestionDesc] = useState('');
  const [questionCat, setQuestionCat] = useState('React');
  const [questionDiff, setQuestionDiff] = useState('medium');
  const [questionType, setQuestionType] = useState('text');
  const [codeBoilerplate, setCodeBoilerplate] = useState('');
  const [isSubmittingQ, setIsSubmittingQ] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [apiUrl]);

  const fetchAdminData = async () => {
    try {
      // Fetch rankings
      const candRes = await axios.get(`${apiUrl}/admin/candidates`);
      if (candRes.data.success) {
        setCandidates(candRes.data.candidates);
      }

      // Fetch sessions
      const sessRes = await axios.get(`${apiUrl}/admin/sessions`);
      if (sessRes.data.success) {
        setSessions(sessRes.data.sessions);
      }

      // Fetch analytics
      const analRes = await axios.get(`${apiUrl}/admin/analytics`);
      if (analRes.data.success) {
        setAnalytics(analRes.data.analytics);
      }
    } catch (err) {
      console.error("Admin dashboard data fetch error:", err);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionTitle || !questionDesc) return;

    try {
      setIsSubmittingQ(true);
      
      const testCases = questionType === 'coding' ? [
        { input: "[2, 7, 11, 15], 9", expectedOutput: "[0,1]", isPublic: true },
        { input: "[3, 2, 4], 6", expectedOutput: "[1,2]", isPublic: true }
      ] : [];

      const res = await axios.post(`${apiUrl}/admin/questions`, {
        title: questionTitle,
        description: questionDesc,
        category: questionCat,
        difficulty: questionDiff,
        type: questionType,
        codeSnippet: codeBoilerplate,
        testCases
      });

      if (res.data.success) {
        alert("Question successfully loaded into AURA Central Bank!");
        setQuestionTitle('');
        setQuestionDesc('');
        setCodeBoilerplate('');
        setQuestionType('text');
        setActiveTab('leaderboard');
        fetchAdminData();
      }
    } catch (err) {
      console.error("Error creating bank question:", err);
      alert("Submission error. Verify parameters.");
    } finally {
      setIsSubmittingQ(false);
    }
  };

  // Recharts Analytics Structuring
  const scoreStatsData = [
    { name: 'Interview Technical', score: analytics.averageTechnicalScore },
    { name: 'Interview Speaking', score: analytics.averageCommunicationScore },
    { name: 'Coding VM Submits', score: analytics.averageCodingScore }
  ];

  const pieData = [
    { name: 'Proctor Clean', value: Math.max(0, analytics.totalInterviews - analytics.totalCheatingAlerts) },
    { name: 'Integrity Alerts', value: analytics.totalCheatingAlerts }
  ];
  const COLORS = ['#00f0ff', '#ff003c'];

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => 
    cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cand.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cand.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto px-6 w-full mt-6">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-wide uppercase text-slate-100 tech-mono">
            ADMINISTRATOR <span className="text-purple-400 font-black">// COMMAND CENTRAL</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 uppercase tracking-wider">
            Secured Platform Monitor • Enterprise Proctoring Systems
          </p>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card-purple p-6 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tech-mono">TOTAL CANDIDATES</span>
              <span className="text-3xl font-black text-purple-400 tech-mono">{analytics.totalCandidates}</span>
            </div>
            <Users className="w-9 h-9 text-purple-500/30" />
          </div>

          <div className="glass-card-purple p-6 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tech-mono">SESSIONS INITIATED</span>
              <span className="text-3xl font-black text-cyan-400 tech-mono">{analytics.totalInterviews}</span>
            </div>
            <Calendar className="w-9 h-9 text-cyan-500/30" />
          </div>

          <div className="glass-card-purple p-6 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tech-mono">COMPLETED INTERVIEWS</span>
              <span className="text-3xl font-black text-emerald-400 tech-mono">{analytics.completedInterviews}</span>
            </div>
            <CheckCircle2 className="w-9 h-9 text-emerald-500/30" />
          </div>

          <div className="glass-card-purple p-6 rounded-2xl flex items-center justify-between border-rose-500/10">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest tech-mono">PROCTOR ALERTS</span>
              <span className={`text-3xl font-black tech-mono ${analytics.totalCheatingAlerts > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                {analytics.totalCheatingAlerts}
              </span>
            </div>
            <AlertOctagon className={`w-9 h-9 ${analytics.totalCheatingAlerts > 0 ? 'text-rose-500/40 animate-bounce' : 'text-slate-700/35'}`} />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Average Scores Bar */}
          <div className="glass-card p-6 rounded-2xl md:col-span-2 flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-4">
              PLATFORM PERFORMANCE AVERAGES
            </h3>
            <div className="h-52 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreStatsData}>
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#475569" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b' }} />
                  <Bar dataKey="score" fill="#bd00ff" radius={[4, 4, 0, 0]} name="Score Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Integrity Distribution Pie */}
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-4">
              PROCTOR INTEGRITY METRICS
            </h3>
            <div className="h-52 w-full text-xs flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute flex flex-col items-center select-none pointer-events-none text-center">
                <span className="text-[9px] text-slate-500 uppercase tech-mono">Clean rate</span>
                <span className="text-sm font-extrabold text-cyan-400 tech-mono">
                  {analytics.totalInterviews > 0 
                    ? Math.round(((analytics.totalInterviews - analytics.totalCheatingAlerts) / analytics.totalInterviews) * 100) 
                    : 100}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Dashboard Tabs & Controls */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          {['leaderboard', 'sessions', 'addquestion'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-bold uppercase tech-mono border-b-2 cursor-pointer transition ${
                activeTab === tab 
                  ? 'border-purple-400 text-purple-400 bg-slate-950/20' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'addquestion' ? 'Questions Bank Manager' : tab === 'sessions' ? 'Telemetry Session Monitor' : 'Rankings Leaderboard'}
            </button>
          ))}
        </div>

        {/* Tab 1: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            
            {/* Search Bar */}
            <div className="relative mb-5 w-full md:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates, skills, role..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-purple-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic tech-mono text-xs">
                No evaluated candidates matched search conditions.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs tech-mono">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase pb-3 select-none">
                      <th className="py-3 px-2">Rank</th>
                      <th>Candidate Name</th>
                      <th>Target Role</th>
                      <th>Skills</th>
                      <th className="text-center">Code Solved</th>
                      <th className="text-center">Tech Rating</th>
                      <th className="text-center">Comm Rating</th>
                      <th className="text-center">Integrity Errors</th>
                      <th className="text-right pr-2">Overall Rank Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 text-slate-300">
                    {filteredCandidates.map((cand, idx) => (
                      <tr key={cand.id} className="hover:bg-slate-900/10 transition">
                        <td className="py-4 px-2 font-bold text-slate-500 flex items-center gap-1">
                          {idx === 0 && <Award className="w-3.5 h-3.5 text-amber-400 inline" />}
                          #{idx + 1}
                        </td>
                        <td className="font-extrabold text-slate-200">{cand.name}</td>
                        <td>{cand.targetRole}</td>
                        <td className="max-w-xs truncate text-[10px] text-slate-400">{cand.skills.join(', ')}</td>
                        <td className="text-center text-emerald-400 font-extrabold">{cand.stats.codingSolved}</td>
                        <td className="text-center text-cyan-400">{cand.stats.avgInterviewScore}%</td>
                        <td className="text-center text-purple-400">{cand.stats.avgCommScore}%</td>
                        <td className={`text-center font-bold ${cand.stats.totalCheatingTriggers > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                          {cand.stats.totalCheatingTriggers}
                        </td>
                        <td className="text-right pr-2 text-sm font-extrabold text-cyan-400">{cand.stats.overallRankScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sessions */}
        {activeTab === 'sessions' && (
          <div className="glass-card p-6 rounded-2xl flex flex-col">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-4">
              ACTIVE TELEMETRY PIPELINE MONITOR
            </h3>

            {sessions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic tech-mono text-xs">
                No active or historical interview sessions detected.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {sessions.map(sess => (
                  <div key={sess._id} className="p-4 bg-slate-900/30 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-200 uppercase">{sess.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          sess.status === 'completed' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' 
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800 animate-pulse'
                        }`}>
                          {sess.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Candidate: <span className="text-slate-300 font-medium">{sess.candidateId?.name || "System Seed"}</span> ({sess.candidateId?.email || "mock@domain.com"})
                      </div>
                      <div className="text-[9px] text-slate-600 tech-mono">
                        Session Key: {sess._id} • Date: {new Date(sess.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {sess.cheatingIncidents.length > 0 && (
                        <div className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-lg text-[9px] tech-mono font-bold animate-pulse">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> PROCTOR ALERT: {sess.cheatingIncidents.length} CHEATS
                        </div>
                      )}

                      {sess.status === 'completed' ? (
                        <div className="flex items-center gap-4 text-xs tech-mono">
                          <div className="text-right">
                            <div className="text-[8px] text-slate-500">TECH_RATING</div>
                            <div className="font-extrabold text-cyan-400">{sess.metrics.overallTechnicalScore}%</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[8px] text-slate-500">COMM_RATING</div>
                            <div className="font-extrabold text-purple-400">{sess.metrics.overallCommunicationScore}%</div>
                          </div>
                          <button
                            onClick={() => navigate(`/report/${sess._id}`)}
                            className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-purple-400/40 hover:text-purple-400 text-slate-300 font-bold rounded-lg cursor-pointer"
                          >
                            Open Logs
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic uppercase tracking-wider tech-mono">STREAMING TELEMETRY...</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Add Question */}
        {activeTab === 'addquestion' && (
          <div className="glass-card p-6 rounded-2xl flex flex-col max-w-2xl mx-auto w-full">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-5 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-400" /> LOAD QUESTION TO PLATFORM BANK
            </h3>

            <form onSubmit={handleAddQuestion} className="flex flex-col gap-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">QUESTION TITLE</label>
                  <input
                    type="text"
                    value={questionTitle}
                    onChange={(e) => setQuestionTitle(e.target.value)}
                    required
                    placeholder="e.g., Explain Docker Containers"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">CATEGORY SEGMENT</label>
                  <input
                    type="text"
                    value={questionCat}
                    onChange={(e) => setQuestionCat(e.target.value)}
                    required
                    placeholder="React, DevOps, Data Structures..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">DIFFICULTY</label>
                  <select
                    value={questionDiff}
                    onChange={(e) => setQuestionDiff(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none"
                  >
                    <option value="easy" className="bg-slate-950">Easy</option>
                    <option value="medium" className="bg-slate-950">Medium</option>
                    <option value="hard" className="bg-slate-950">Hard</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">QUESTION ASSESSMENT TYPE</label>
                  <div className="grid grid-cols-2 gap-2 text-[10px] tech-mono font-bold uppercase">
                    {['text', 'coding'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setQuestionType(type)}
                        className={`py-2 border rounded-xl transition cursor-pointer ${
                          questionType === type 
                            ? 'bg-purple-950 text-purple-400 border-purple-500/30' 
                            : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {type === 'coding' ? 'Coding Arena challenge' : 'Standard verbal question'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">DETAILED DESCRIPTION / QUESTION STATEMENT</label>
                <textarea
                  value={questionDesc}
                  onChange={(e) => setQuestionDesc(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the challenge statement or provide standard interview prompt question..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none resize-none"
                />
              </div>

              {questionType === 'coding' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono">STARTER CODE BOILERPLATE Snippet (JAVASCRIPT)</label>
                  <textarea
                    value={codeBoilerplate}
                    onChange={(e) => setCodeBoilerplate(e.target.value)}
                    rows={4}
                    placeholder={`function solution(nums, target) {\n  // Write code here\n}`}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-emerald-400 tech-mono focus:outline-none resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingQ}
                className="w-full py-3.5 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-800 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-widest transition duration-300 cursor-pointer shadow-[0_0_15px_rgba(189,0,255,0.2)] mt-2"
              >
                {isSubmittingQ ? "COMMITTING_DATA..." : "LOAD QUESTION"}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
