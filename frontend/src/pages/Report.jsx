import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Award, ShieldAlert, Sparkles, CheckCircle2, ChevronDown, ChevronUp, Clock, AlertTriangle, FileText, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Report() {
  const { id: interviewId } = useParams();
  const { user, apiUrl } = useAuth();

  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  useEffect(() => {
    fetchReportDetails();
  }, [interviewId]);

  const fetchReportDetails = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${apiUrl}/interviews/${interviewId}/report`);
      if (res.data.success) {
        setInterview(res.data.interview);
      }
    } catch (err) {
      console.error("Error loading interview report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <span className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs tech-mono tracking-widest animate-pulse">SYNTHESIZING_AI_DIAGNOSTICS...</span>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-rose-400 italic">
          <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
          <p className="text-sm font-semibold tech-mono">INTERVIEW REPORT LOGS CORRUPTED OR NOT FOUND</p>
          <Link to="/dashboard" className="text-cyan-400 hover:underline text-xs mt-2 tech-mono">Back to Cockpit</Link>
        </div>
      </div>
    );
  }

  const { metrics, questions, cheatingIncidents, aiReport, title, type, createdAt } = interview;

  // Radar chart competencies structure
  const competencyData = [
    { subject: 'Tech Correctness', A: metrics.overallTechnicalScore || 70, fullMark: 100 },
    { subject: 'Speech Fluency', A: metrics.overallCommunicationScore || 75, fullMark: 100 },
    { subject: 'Topic Coverage', A: Math.min(100, questions.length * 20), fullMark: 100 },
    { subject: 'Biometric Focus', A: metrics.faceScanLogs.length > 0 
        ? Math.round(metrics.faceScanLogs.reduce((sum, f) => sum + f.focusScore, 0) / metrics.faceScanLogs.length) 
        : 96, fullMark: 100 },
    { subject: 'Stress Control', A: metrics.faceScanLogs.filter(f => f.stressLevel === 'LOW').length > 0 
        ? Math.round((metrics.faceScanLogs.filter(f => f.stressLevel === 'LOW').length / metrics.faceScanLogs.length) * 100)
        : 90, fullMark: 100 }
  ];

  // Face Scan Logs Chart
  const stressTimeline = metrics.faceScanLogs.map((log, idx) => ({
    time: `Q${idx + 1}`,
    focus: log.focusScore,
    confidence: log.confidenceScore
  }));

  // Fallback stress timeline if no scan logs recorded
  const sampleTimeline = stressTimeline.length > 0 ? stressTimeline : [
    { time: 'Q1', focus: 98, confidence: 85 },
    { time: 'Q2', focus: 95, confidence: 80 },
    { time: 'Q3', focus: 97, confidence: 92 },
    { time: 'Q4', focus: 99, confidence: 88 },
    { time: 'Q5', focus: 96, confidence: 90 }
  ];

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto px-6 w-full mt-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex justify-between items-center select-none">
          <Link 
            to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
            className="inline-flex items-center gap-1 text-xs tech-mono text-slate-500 hover:text-cyan-400 uppercase tracking-widest cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          <span className="text-[10px] tech-mono text-slate-500 uppercase">REPORT_UUID: {interviewId}</span>
        </div>

        {/* Header summary panel */}
        <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[rgba(0,240,255,0.15)] mb-8 bg-slate-950/65 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide uppercase text-slate-100 tech-mono">{title}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="uppercase text-cyan-400 tracking-widest tech-mono">{type} mock</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Finished on {new Date(createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[9px] text-slate-500 tech-mono uppercase">FINAL TECH RATING</div>
              <div className="text-3xl font-black text-cyan-400 tech-mono">{metrics.overallTechnicalScore}%</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-slate-500 tech-mono uppercase">SPEAKING RATING</div>
              <div className="text-3xl font-black text-purple-400 tech-mono">{metrics.overallCommunicationScore}%</div>
            </div>
          </div>
        </div>

        {/* 2 Column Stats & Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Radar competencies */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-4 w-full text-left">
              COMPETENCY RADAR
            </h3>
            <div className="h-48 w-full text-[10px] tech-mono flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={competencyData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" stroke="#64748b" />
                  <PolarRadiusAxis stroke="#64748b" domain={[0, 100]} />
                  <Radar name="Candidate" dataKey="A" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line telemetry focus chart */}
          <div className="glass-card p-6 rounded-2xl flex flex-col md:col-span-2">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-4 w-full text-left">
              BIOMETRIC FOCUS TELEMETRY INDEX
            </h3>
            <div className="h-48 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleTimeline}>
                  <XAxis dataKey="time" stroke="#475569" />
                  <YAxis stroke="#475569" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b' }} />
                  <Line type="monotone" dataKey="focus" stroke="#00f0ff" strokeWidth={2} name="Focus Index" dot={{ fill: '#00f0ff' }} />
                  <Line type="monotone" dataKey="confidence" stroke="#bd00ff" strokeWidth={1.5} name="Speech Confidence" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Proctoring Audits Alerts Box */}
        <div className="glass-card p-6 rounded-2xl mb-8 border border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> PROCTORED INTEGRITY SYSTEM AUDIT LOGS
          </h3>

          {cheatingIncidents.length === 0 ? (
            <div className="flex items-center gap-3 text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl text-xs font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Perfect Integrity Score! No tab switching, background redirection, or focus abnormalities detected during this session.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-rose-400 bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl text-xs font-bold animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <span>INTEGRITY ALERT: Proctorship logged {cheatingIncidents.length} compliance abnormalities during assessment.</span>
              </div>
              <div className="flex flex-col gap-1.5 divide-y divide-slate-900/40 text-[10px] tech-mono text-slate-500 px-2">
                {cheatingIncidents.map((inc, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <span className="text-rose-400 uppercase font-bold">WARNING #{i+1} // {inc.type === 'tab_switch' ? 'BROWSER TAB SWITCH DETECTED' : 'CAMERA FOCUS anomaly'}</span>
                    <span>{new Date(inc.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Q&A Transcripts Analysis */}
        <div className="glass-card p-6 rounded-2xl mb-8">
          <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-5">
            SPEECH Q&A EVALUATION DRILLDOWN
          </h3>

          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => {
              const isExpanded = expandedQuestion === idx;
              
              return (
                <div key={q._id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
                  {/* Collapsible header */}
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? -1 : idx)}
                    className="w-full px-5 py-4 text-left bg-slate-900/30 hover:bg-slate-900/60 cursor-pointer flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-extrabold text-slate-200">Question {idx + 1}: {q.questionText.substring(0, 75)}...</span>
                      <span className="text-[9px] uppercase tracking-wider tech-mono text-slate-500">
                        Topic: {q.category} • Difficulty: {q.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-cyan-400 tech-mono">{q.evaluation?.score || 0}/100</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </button>

                  {/* Body details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-900 flex flex-col gap-4 text-xs leading-relaxed">
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest tech-mono">QUESTION POSED</span>
                        <p className="text-slate-300 font-medium">{q.questionText}</p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest tech-mono">CANDIDATE RESPONSE TRANSLATION</span>
                        <p className="text-slate-400 leading-relaxed italic bg-slate-900/35 border border-slate-900 p-3 rounded-lg">
                          "{q.answerTranscript || 'No response captured.'}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl">
                          <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest tech-mono block mb-1">TECHNICAL VERACITY ASSESSMENT</span>
                          <p className="text-slate-300 italic">{q.evaluation?.technicalAccuracy || 'Technical grading pending.'}</p>
                        </div>

                        <div className="p-4 bg-purple-950/10 border border-purple-900/30 rounded-xl">
                          <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest tech-mono block mb-1">COMMUNICATION & ARTICULATION</span>
                          <p className="text-slate-300 italic">{q.evaluation?.communicationSkills || 'Communication grading pending.'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-950/70 border border-slate-900 py-2.5 px-4 rounded-xl text-[10px] tech-mono text-slate-500">
                        <span>SENTIMENT: <span className="text-cyan-400 font-extrabold uppercase">{q.sentiment || 'Neutral'}</span></span>
                        <span>CONFIDENCE SCORE: <span className="text-purple-400 font-extrabold">{q.confidenceScore || 0}%</span></span>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Synthesized AI Markdown Report */}
        {aiReport && (
          <div className="glass-card p-8 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> FULL SYNTHESIZED EXECUTIVE AI EVALUATION REPORT
            </h3>

            {/* Render markdown dynamically */}
            <div className="prose prose-invert prose-cyan max-w-none text-slate-300 leading-relaxed text-sm whitespace-pre-line">
              <div className="absolute top-4 right-4 animate-cyber-pulse">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              {aiReport}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
