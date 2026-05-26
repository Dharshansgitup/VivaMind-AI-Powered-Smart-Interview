import React, { useState, useEffect } from 'react';
import { Play, Send, RefreshCw, Terminal, CheckCircle2, XCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function CodeEditor({ challenge, onSubmitSuccess }) {
  const { apiUrl } = useAuth();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState('console'); // 'console' or 'testcases'

  // Sync challenge boilerplate when challenge or language changes
  useEffect(() => {
    if (challenge) {
      if (language === 'javascript') {
        setCode(challenge.codeSnippet || '');
      } else if (language === 'python') {
        setCode(`# Python 3 Solution Template\ndef solution(nums, target):\n    # Write Python code here\n    pass`);
      } else if (language === 'cpp') {
        setCode(`// C++ Solution Template\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // Write C++ code here\n        return {};\n    }\n};`);
      }
      setConsoleLogs(['System: Editor environment initialized. Ready to compile.']);
      setTestResults(null);
    }
  }, [challenge, language]);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your code to the default boilerplate?")) {
      if (language === 'javascript') {
        setCode(challenge.codeSnippet || '');
      } else if (language === 'python') {
        setCode(`# Python 3 Solution\ndef solution(nums, target):\n    pass`);
      } else {
        setCode(`// C++ Solution\n#include <iostream>\nusing namespace std;\n// ...`);
      }
      setConsoleLogs(['System: Code editor reset to original template.']);
      setTestResults(null);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    try {
      setIsCompiling(true);
      setActiveTab('console');
      setConsoleLogs(['Compiling and running code...']);
      
      const res = await axios.post(`${apiUrl}/coding/run`, {
        questionId: challenge._id,
        language,
        code
      });

      if (res.data.success) {
        const result = res.data.runResult;
        const newLogs = [];
        
        newLogs.push(`Compiler: ${language.toUpperCase()} executor finished.`);
        newLogs.push(`Status: ${result.passedCount === result.totalCount ? 'SUCCESS' : 'FAILED'}`);
        newLogs.push(`Passed ${result.passedCount}/${result.totalCount} public test cases.`);
        newLogs.push(`----------------------------------------`);
        
        result.results.forEach((tc, idx) => {
          newLogs.push(`[Test Case ${idx + 1}] Input: ${tc.input}`);
          newLogs.push(`Expected Output: ${tc.expected}`);
          newLogs.push(`Actual Output: ${tc.actual}`);
          newLogs.push(`Result: ${tc.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
          newLogs.push(`Execution Log: ${tc.stdout}`);
          newLogs.push(`----------------------------------------`);
        });

        setConsoleLogs(newLogs);
        setTestResults(result);
      }
    } catch (err) {
      console.error("Code run error:", err);
      setConsoleLogs([
        'Error: Connection failed or syntax compilation crashed.',
        err.response?.data?.message || err.message
      ]);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    try {
      setIsCompiling(true);
      setActiveTab('console');
      setConsoleLogs(['Submitting code to central evaluation server...']);
      
      const res = await axios.post(`${apiUrl}/coding/submit`, {
        questionId: challenge._id,
        language,
        code
      });

      if (res.data.success) {
        const sub = res.data.submission;
        const newLogs = [];
        newLogs.push(`SUBMISSION COMMITTED SUCCESSFULLY`);
        newLogs.push(`Final Score: ${sub.score}/100`);
        newLogs.push(`Status: ${sub.status.toUpperCase()}`);
        newLogs.push(`Passed ${sub.passedCount}/${sub.totalCount} verification cases (including hidden assertions).`);
        
        setConsoleLogs(newLogs);
        
        if (onSubmitSuccess) {
          onSubmitSuccess(sub);
        }
      }
    } catch (err) {
      console.error("Submission error:", err);
      setConsoleLogs([
        'Error: Submission pipeline encounter. Verify code structure.',
        err.response?.data?.message || err.message
      ]);
    } finally {
      setIsCompiling(false);
    }
  };

  // Split lines for IDE numbers column
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(12, lineCount) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[640px] terminal-window overflow-hidden border border-slate-800">
      
      {/* 1. Header Toolbar */}
      <div className="terminal-header select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold text-slate-400 tech-mono">
            COMPILER // {challenge?.title || "IDE"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] tech-mono font-bold">
            {['javascript', 'python', 'cpp'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-md uppercase cursor-pointer ${
                  language === lang 
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          <button 
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 bg-slate-900/40 hover:bg-slate-900 cursor-pointer"
            title="Reset to Template"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Coding Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Editor Line Numbers */}
        <div className="w-10 bg-[#030408] border-r border-slate-900/60 py-4 flex flex-col items-center select-none text-slate-700 tech-mono text-xs text-right pr-2">
          {lineNumbers.map(n => (
            <div key={n} className="h-6 leading-6">{n}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-[#05070c] p-4 text-emerald-400 tech-mono text-xs leading-6 resize-none focus:outline-none overflow-y-auto selection:bg-cyan-900 selection:text-cyan-200"
        />

        {/* Compile Loading Overlay */}
        {isCompiling && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-300 tech-mono tracking-widest animate-pulse">COMPILING_CODE_SANDBOX...</span>
          </div>
        )}
      </div>

      {/* 3. Output Console Panel */}
      <div className="h-56 bg-slate-950 border-t border-slate-900/80 flex flex-col">
        {/* Console Nav Tabs */}
        <div className="flex items-center justify-between bg-[#070a13] px-4 border-b border-slate-900 text-[10px] tech-mono font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'console' 
                  ? 'border-cyan-400 text-cyan-400 bg-slate-950/40' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> CONSOLE OUTPUT
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-3 py-2 flex items-center gap-1.5 border-b-2 cursor-pointer ${
                activeTab === 'testcases' 
                  ? 'border-cyan-400 text-cyan-400 bg-slate-950/40' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> TEST SUITE DETAILS
            </button>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-2.5 py-1">
            <button
              onClick={handleRunCode}
              disabled={isCompiling || !challenge}
              className="px-3.5 py-1.5 text-[10px] font-extrabold bg-slate-900 border border-slate-800 hover:border-cyan-400/40 text-slate-300 hover:text-cyan-400 rounded-lg flex items-center gap-1 cursor-pointer transition disabled:opacity-40"
            >
              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" /> RUN CODE
            </button>
            <button
              onClick={handleSubmitCode}
              disabled={isCompiling || !challenge}
              className="px-3.5 py-1.5 text-[10px] font-extrabold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-lg flex items-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.2)] transition disabled:opacity-40"
            >
              <Send className="w-3 h-3" /> SUBMIT EXAM
            </button>
          </div>
        </div>

        {/* Console Content Window */}
        <div className="flex-1 p-4 overflow-y-auto text-xs leading-5 tech-mono bg-[#030509]">
          {activeTab === 'console' ? (
            <div className="flex flex-col gap-0.5">
              {consoleLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={
                    log.includes('SUCCESS') || log.includes('✅')
                      ? 'text-emerald-400' 
                      : log.includes('FAILED') || log.includes('❌') || log.includes('Error')
                        ? 'text-rose-500 font-semibold'
                        : log.includes('SUBMISSION')
                          ? 'text-cyan-400 font-extrabold tracking-widest'
                          : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {testResults ? (
                testResults.results.map((tc, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <div><span className="text-slate-500">Input:</span> <span className="text-slate-300">{tc.input}</span></div>
                      <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{tc.expected}</span></div>
                      <div><span className="text-slate-500">Actual:</span> <span className={tc.passed ? 'text-emerald-400' : 'text-rose-500'}>{tc.actual}</span></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tc.passed ? (
                        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> PASSED
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <XCircle className="w-3 h-3" /> FAILED
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-600 italic text-center py-6">
                  No execution diagnostics available yet. Run your code to display verification test logs.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Console Status Footer */}
        <div className="bg-[#05070c] border-t border-slate-900 px-4 py-1.5 text-[9px] tech-mono text-slate-500 flex items-center justify-between uppercase">
          <span>IDE ENGINE // READY</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> SECURE_JS_VM: 1500MS_LIMIT</span>
        </div>
      </div>

    </div>
  );
}
