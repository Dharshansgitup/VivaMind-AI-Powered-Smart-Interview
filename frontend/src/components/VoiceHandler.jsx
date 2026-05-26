import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader } from 'lucide-react';

export default function VoiceHandler({ isAiTalking, onTranscriptResult, isEvaluating }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interimText += result[0].transcript;
          }
        }

        const currentText = (finalText + interimText).trim();
        setTranscript(currentText);
        if (onTranscriptResult) {
          onTranscriptResult(currentText);
        }
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  }, [onTranscriptResult]);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Start speech failed:", err);
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    if (onTranscriptResult) onTranscriptResult('');
  };

  return (
    <div className="flex flex-col items-center p-6 glass-card rounded-2xl border border-[rgba(0,240,255,0.15)] bg-slate-950/80 w-full">
      {/* 1. Holographic AI Avatar Orb */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-6">
        {/* Core Glowing Orb */}
        <div className={`absolute w-24 h-24 rounded-full filter blur-[1px] transition-all duration-700 ease-in-out ${
          isEvaluating 
            ? 'bg-purple-500/80 shadow-[0_0_40px_rgba(189,0,255,0.75)] animate-spin duration-3000' 
            : isListening 
              ? 'bg-emerald-500/80 shadow-[0_0_40px_rgba(57,255,20,0.75)] animate-pulse'
              : isAiTalking
                ? 'bg-cyan-500/90 shadow-[0_0_40px_rgba(0,240,255,0.85)] scale-110' 
                : 'bg-cyan-950/60 shadow-[0_0_20px_rgba(0,240,255,0.15)] border border-cyan-800/40'
        }`}>
          {/* Internal futuristic mesh line overlays */}
          <div className="w-full h-full rounded-full opacity-40 bg-[radial-gradient(#05070c_1px,transparent_1px)] bg-[size:6px_6px]" />
        </div>

        {/* Orbiting Laser Ring Accents */}
        <div className={`absolute w-32 h-32 rounded-full border-2 border-dashed border-cyan-400/35 transition-transform duration-1000 ${
          isListening || isAiTalking ? 'animate-spin' : 'opacity-40'
        }`} />
        
        {/* Voice Frequency Indicators (Reactive wave lines) */}
        {isAiTalking && (
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none">
            <span className="w-1.5 h-6 bg-cyan-400 rounded-full wave-bar-slow" />
            <span className="w-1.5 h-12 bg-cyan-300 rounded-full wave-bar-mid" />
            <span className="w-1.5 h-16 bg-cyan-400 rounded-full wave-bar-fast" />
            <span className="w-1.5 h-12 bg-cyan-300 rounded-full wave-bar-mid" />
            <span className="w-1.5 h-6 bg-cyan-400 rounded-full wave-bar-slow" />
          </div>
        )}
        
        {isListening && !isAiTalking && (
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none">
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full wave-bar-slow" />
            <span className="w-1.5 h-9 bg-emerald-300 rounded-full wave-bar-mid" />
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full wave-bar-slow" />
          </div>
        )}

        {isEvaluating && (
          <Loader className="w-10 h-10 text-purple-400 animate-spin absolute" />
        )}
      </div>

      <div className="text-center mb-6">
        <h3 className="font-bold text-sm text-slate-200 tracking-wider tech-mono">
          {isEvaluating 
            ? "SYS.STATUS // EVALUATING_ANSWER..." 
            : isListening 
              ? "AI INTERVIEWER // LISTENING" 
              : isAiTalking 
                ? "AI INTERVIEWER // SPEAKING" 
                : "AI INTERVIEWER // READY"
          }
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isListening ? "Speak clearly. Transcript updates automatically below." : "Click below to activate microphone."}
        </p>
      </div>

      {/* 2. Interactive Voice Controls */}
      <div className="flex items-center gap-4 mb-4">
        <button 
          onClick={toggleListen}
          disabled={isEvaluating}
          className={`p-4 rounded-full border cursor-pointer transition-all duration-300 ${
            isListening 
              ? 'bg-rose-950/40 text-rose-400 border-rose-500 hover:bg-rose-900/40 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 hover:shadow-[0_0_20px_rgba(0,240,255,0.45)]'
          } disabled:opacity-40 disabled:pointer-events-none`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6 animate-pulse" />
          )}
        </button>
      </div>

      {/* 3. Live Speech Transcript Window */}
      <div className="w-full">
        <div className="flex items-center justify-between px-3 py-2 border border-slate-800 bg-slate-950/90 rounded-t-xl text-[10px] tech-mono text-slate-500 uppercase">
          <span>SPEECH_TO_TEXT TRANSCRIPT</span>
          {transcript && (
            <button 
              onClick={clearTranscript}
              className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        <div className="w-full min-h-24 max-h-36 overflow-y-auto p-4 bg-slate-900/60 border border-t-0 border-slate-800 rounded-b-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none">
          {transcript ? (
            <p className="leading-relaxed leading-6">{transcript}</p>
          ) : (
            <span className="text-slate-600 italic">No audio detected yet. Click the mic button to speak your answer...</span>
          )}
        </div>
      </div>
    </div>
  );
}
