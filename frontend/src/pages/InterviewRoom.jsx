import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, AlertTriangle, Play, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import EmotionTracker from '../components/EmotionTracker';
import VoiceHandler from '../components/VoiceHandler';

export default function InterviewRoom() {
  const { id: interviewId } = useParams();
  const navigate = useNavigate();
  const { apiUrl } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState({
    index: 0,
    text: 'Loading opening interview question...',
    category: 'React',
    difficulty: 'medium'
  });
  
  const [chatLogs, setChatLogs] = useState([]);
  const [transcriptText, setTranscriptText] = useState('');
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const [cheatingCount, setCheatingCount] = useState(0);
  const [interviewStatus, setInterviewStatus] = useState('in_progress');

  // Real-time canvas biometrics updates
  const activeBiometrics = useRef({
    stressLevel: 'Low',
    focusScore: 98,
    confidenceScore: 85
  });

  // Track proctorship tab-switching triggers
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && interviewStatus === 'in_progress') {
        try {
          const res = await axios.post(`${apiUrl}/interviews/${interviewId}/cheating`, {
            type: 'tab_switch'
          });
          if (res.data.success) {
            setCheatingCount(res.data.incidentCount);
            alert(`WARNING: Tab switch detected! This event has been logged in AURA recruitment proctorship audits. [Warnings: ${res.data.incidentCount}]`);
          }
        } catch (err) {
          console.error("Proctorship report delivery error:", err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [interviewId, interviewStatus]);

  // Load interview details / current question on mount
  useEffect(() => {
    loadInterviewRoom();
  }, [interviewId]);

  const loadInterviewRoom = async () => {
    try {
      const res = await axios.get(`${apiUrl}/interviews/${interviewId}/report`);
      if (res.data.success) {
        const interview = res.data.interview;
        setInterviewStatus(interview.status);
        setCheatingCount(interview.cheatingIncidents.length);

        if (interview.status === 'completed') {
          navigate(`/report/${interviewId}`);
          return;
        }

        const totalQ = interview.questions.length;
        setQuestionCount(totalQ);
        
        const latestQuestion = interview.questions[totalQ - 1];
        
        setCurrentQuestion({
          index: totalQ - 1,
          text: latestQuestion.questionText,
          category: latestQuestion.category,
          difficulty: latestQuestion.difficulty
        });

        // Initialize Chat dialogue history
        const initialLogs = [];
        interview.questions.forEach((q, idx) => {
          initialLogs.push({ sender: 'ai', text: q.questionText });
          if (q.answerTranscript) {
            initialLogs.push({ sender: 'candidate', text: q.answerTranscript, evaluation: q.evaluation });
          }
        });

        setChatLogs(initialLogs);
        triggerTextToSpeech(latestQuestion.questionText);
      }
    } catch (err) {
      console.error("Error loading interview details:", err);
    }
  };

  // Text-To-Speech audio output
  const triggerTextToSpeech = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsAiTalking(true);
      utterance.onend = () => setIsAiTalking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMetricUpdate = async (metrics) => {
    activeBiometrics.current = {
      stressLevel: metrics.stressLevel,
      focusScore: metrics.focusScore,
      confidenceScore: metrics.confidenceScore
    };

    // Strict Malpractice Check: If eye-focus drops below 96% (meaning looked-away or camera covered)
    if (metrics.focusScore < 96 && interviewStatus === 'in_progress') {
      try {
        const res = await axios.post(`${apiUrl}/interviews/${interviewId}/cheating`, {
          type: 'face_lost'
        });
        if (res.data.success) {
          setCheatingCount(res.data.incidentCount);
        }
      } catch (err) {
        console.error("Failed to log focus malpractice alert:", err);
      }
    }
  };

  const handleTranscriptUpdate = (text) => {
    setTranscriptText(text);
  };

  // Submit Answer evaluation
  const handleSubmitAnswer = async () => {
    if (!transcriptText.trim() || isEvaluating) return;

    try {
      setIsEvaluating(true);
      
      const res = await axios.post(`${apiUrl}/interviews/${interviewId}/answer`, {
        answerTranscript: transcriptText,
        stressLevel: activeBiometrics.current.stressLevel,
        focusScore: activeBiometrics.current.focusScore,
        confidenceScore: activeBiometrics.current.confidenceScore
      });

      if (res.data.success) {
        const evalData = res.data.evaluation;
        
        // Append user answer + AI feedback to logs
        setChatLogs(prev => [
          ...prev, 
          { sender: 'candidate', text: transcriptText, evaluation: evalData }
        ]);

        setTranscriptText('');
        setIsEvaluating(false);

        // Auto trigger next step
        if (questionCount >= 5) {
          handleFinalizeInterview();
        } else {
          handleFetchNextQuestion();
        }
      }
    } catch (err) {
      console.error("Submit answer error:", err);
      alert("Error evaluating candidate answer. Try submitting again.");
      setIsEvaluating(false);
    }
  };

  // Fetch next dynamic question
  const handleFetchNextQuestion = async () => {
    try {
      setIsEvaluating(true);
      const res = await axios.post(`${apiUrl}/interviews/${interviewId}/next`);
      if (res.data.success) {
        if (res.data.completed) {
          handleFinalizeInterview();
        } else {
          const nextQ = res.data.currentQuestion;
          setCurrentQuestion({
            index: nextQ.index,
            text: nextQ.text,
            category: nextQ.category,
            difficulty: nextQ.difficulty
          });
          setQuestionCount(nextQ.index + 1);
          setChatLogs(prev => [...prev, { sender: 'ai', text: nextQ.text }]);
          triggerTextToSpeech(nextQ.text);
        }
      }
    } catch (err) {
      console.error("Fetch next question failed:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Finalize interview session
  const handleFinalizeInterview = async () => {
    try {
      setIsEvaluating(true);
      const res = await axios.post(`${apiUrl}/interviews/${interviewId}/finalize`);
      if (res.data.success) {
        setInterviewStatus('completed');
        navigate(`/report/${interviewId}`);
      }
    } catch (err) {
      console.error("Error finalizing session:", err);
      alert("Failed compiling final AI evaluation. Open diagnostic report page.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto px-6 w-full mt-6">
        
        {/* Header Progress status */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold uppercase tech-mono tracking-widest text-slate-100">
              AI ROOM <span className="text-cyan-400 font-extrabold">// SESSION</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] tech-mono text-cyan-400 font-bold uppercase">
              Question {questionCount} of 5
            </span>
          </div>

          <div className="flex items-center gap-4">
            {cheatingCount > 0 && (
              <div className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-lg text-[10px] tech-mono font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-500" /> PROCTOR WARNINGS: {cheatingCount}
              </div>
            )}
            <div className="text-[10px] tech-mono text-slate-500 uppercase">
              SECURE_ROOM_KEY: {interviewId.substring(0, 8)}...
            </div>
          </div>
        </div>

        {/* 2 Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: AI Chat dialogue window */}
          <div className="lg:col-span-2 flex flex-col h-[520px] glass-card rounded-2xl overflow-hidden border border-slate-800">
            {/* Header tab */}
            <div className="bg-[#070a13] border-b border-slate-900 px-4 py-3 text-[10px] tech-mono font-bold text-slate-400 uppercase flex justify-between items-center select-none">
              <span>LIVE AI INTERVIEW CHAT DIALOGUES</span>
              <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Gemini Realtime Engine</span>
            </div>

            {/* Chat Messages Logs */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-slate-950/30">
              {chatLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-[85%] ${
                    log.sender === 'ai' 
                      ? 'self-start items-start' 
                      : 'self-end items-end'
                  }`}
                >
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 tech-mono mb-1">
                    {log.sender === 'ai' ? 'AI RECRUITER' : 'CANDIDATE'}
                  </span>
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                    log.sender === 'ai'
                      ? 'bg-slate-900/60 border-slate-800 text-slate-200 rounded-tl-none'
                      : 'bg-cyan-950/20 border-cyan-800/40 text-slate-200 rounded-tr-none'
                  }`}>
                    {log.text}
                  </div>

                  {/* AI Evaluation feedback appended to candidate's answer */}
                  {log.sender === 'candidate' && log.evaluation && (
                    <div className="mt-2 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-[11px] text-emerald-400 w-full flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold tech-mono text-[9px] uppercase tracking-wider block mb-1">AI IMMEDIATE FEEDBACK // Score: {log.evaluation.score}/100</span>
                        <p className="leading-relaxed leading-5 italic">{log.evaluation.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isEvaluating && (
                <div className="self-start flex items-center gap-2 text-xs text-slate-500 tech-mono py-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                  AI Evaluator compiles feedback metrics...
                </div>
              )}
            </div>

            {/* Manual answer typing fallback form */}
            <div className="border-t border-slate-900 p-3 bg-slate-950/60 flex items-center gap-2">
              <input
                type="text"
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                disabled={isEvaluating}
                placeholder="Type response fallback or speak response using mic..."
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!transcriptText.trim() || isEvaluating}
                className="p-3 bg-cyan-400 hover:bg-cyan-300 disabled:bg-cyan-800 text-slate-950 rounded-xl cursor-pointer transition shadow-[0_0_10px_rgba(0,240,255,0.15)] disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column: Telemetry & Webcam HUD */}
          <div className="flex flex-col gap-6 w-full">
            
            {/* Webcam hud mesh */}
            <EmotionTracker onMetricUpdate={handleMetricUpdate} />

            {/* AI Waveform and mic */}
            <VoiceHandler 
              isAiTalking={isAiTalking} 
              onTranscriptResult={handleTranscriptUpdate} 
              isEvaluating={isEvaluating} 
            />

          </div>

        </div>

      </div>
    </div>
  );
}
