import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Terminal, Brain, ChevronRight, Award, CheckCircle2, ChevronLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import CodeEditor from '../components/CodeEditor';
import { Link } from 'react-router-dom';

export default function CodingTest() {
  const { apiUrl } = useAuth();
  
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [solvedStatuses, setSolvedStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, [apiUrl]);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${apiUrl}/coding/challenges`);
      if (res.data.success) {
        const list = res.data.challenges;
        setChallenges(list);
        if (list.length > 0) {
          setSelectedChallenge(list[0]);
        }
      }
    } catch (err) {
      console.error("Error loading coding challenges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmissionSuccess = (submission) => {
    // Record solved status locally for UI checklist
    setSolvedStatuses(prev => ({
      ...prev,
      [submission.questionId]: {
        solved: submission.score === 100,
        score: submission.score
      }
    }));
    
    alert(`Submission completed! Your final score is: ${submission.score}/100. Status: ${submission.status.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen cyber-bg cyber-grid flex flex-col pb-16">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto px-6 w-full mt-6">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-1 text-xs tech-mono text-slate-500 hover:text-cyan-400 uppercase tracking-widest cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <span className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs tech-mono tracking-widest animate-pulse">BOOTING_COMPILER_ARENA...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Challenge list and Description */}
            <div className="flex flex-col gap-6">
              
              {/* Challenge Selector */}
              <div className="glass-card p-5 rounded-2xl flex flex-col">
                <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase border-b border-slate-900 pb-3 mb-4 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" /> SELECT CHALLENGE
                </h3>
                
                <div className="flex flex-col gap-2">
                  {challenges.map(chall => {
                    const status = solvedStatuses[chall._id];
                    const isSelected = selectedChallenge?._id === chall._id;

                    return (
                      <button
                        key={chall._id}
                        onClick={() => setSelectedChallenge(chall)}
                        className={`w-full p-3.5 text-left border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-cyan-950/30 text-cyan-300 border-cyan-500/30' 
                            : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-extrabold uppercase">{chall.title}</span>
                          <span className="text-[9px] uppercase tracking-wider tech-mono text-slate-500">
                            {chall.category} • <span className={
                              chall.difficulty === 'easy' ? 'text-emerald-400' : 'text-amber-400'
                            }>{chall.difficulty}</span>
                          </span>
                        </div>

                        {status?.solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : status?.score !== undefined ? (
                          <div className="text-[10px] font-bold text-rose-400 tech-mono">{status.score}%</div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Challenge Description panel */}
              {selectedChallenge && (
                <div className="glass-card p-6 rounded-2xl flex-1 flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4 select-none">
                    <h3 className="text-xs font-bold text-slate-300 tech-mono uppercase flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" /> DESCRIPTION
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tech-mono ${
                      selectedChallenge.difficulty === 'easy' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {selectedChallenge.difficulty}
                    </span>
                  </div>

                  <div className="text-xs leading-relaxed text-slate-300 font-medium whitespace-pre-line flex-1">
                    <h2 className="text-sm font-bold text-slate-100 uppercase mb-3">{selectedChallenge.title}</h2>
                    {selectedChallenge.description}
                  </div>

                  {selectedChallenge.sampleAnswer && (
                    <div className="mt-6 border-t border-slate-900 pt-4 text-[10px] text-slate-500 tech-mono">
                      <span className="font-extrabold uppercase text-purple-400 flex items-center gap-1 mb-1">
                        <Award className="w-3.5 h-3.5" /> Conceptual Strategy
                      </span>
                      {selectedChallenge.sampleAnswer}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Code Editor workspace */}
            <div className="lg:col-span-2">
              <CodeEditor 
                challenge={selectedChallenge} 
                onSubmitSuccess={handleSubmissionSuccess} 
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
