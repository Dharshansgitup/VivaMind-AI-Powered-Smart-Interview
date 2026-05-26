import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

export default function EmotionTracker({ onMetricUpdate }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  // Real-time HUD states
  const [telemetry, setTelemetry] = useState({
    focus: 98,
    stress: 'LOW',
    confidence: 85,
    pulseRate: 72,
    blinkCount: 4
  });

  // Start webcam stream
  const startCamera = async () => {
    try {
      setCameraError(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error("Webcam stream access failed:", err);
      setCameraError(true);
      setStreamActive(false);
    }
  };

  // Close webcam stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Canvas Sci-Fi Neural Grid loop
  useEffect(() => {
    if (!streamActive) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let scanY = 0;
    let scanDirection = 1;
    let frameCount = 0;
    let mockPulse = 72;
    let mockFocus = 98;
    let mockConfidence = 85;

    // Define floating facial grid node templates (proportional positions inside a virtual box)
    const relativeFaceNodes = [
      { id: 'forehead', rx: 0.5, ry: 0.25 },
      { id: 'left-eye', rx: 0.38, ry: 0.42 },
      { id: 'right-eye', rx: 0.62, ry: 0.42 },
      { id: 'nose-bridge', rx: 0.5, ry: 0.5 },
      { id: 'nose-tip', rx: 0.5, ry: 0.6 },
      { id: 'left-cheek', rx: 0.32, ry: 0.63 },
      { id: 'right-cheek', rx: 0.68, ry: 0.63 },
      { id: 'mouth-left', rx: 0.43, ry: 0.74 },
      { id: 'mouth-right', rx: 0.57, ry: 0.74 },
      { id: 'chin', rx: 0.5, ry: 0.85 }
    ];

    const renderLoop = () => {
      if (video.readyState >= video.HAVE_METADATA) {
        // Clear canvas for transparent overlay updates
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Core coordinates of a simulated "detected face box"
        const boxX = canvas.width * 0.22;
        const boxY = canvas.height * 0.15;
        const boxW = canvas.width * 0.56;
        const boxH = canvas.height * 0.72;

        // 1. Draw glowing corner brackets for Face Detection Box
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        const lineLen = 20;

        // Top Left
        ctx.beginPath(); ctx.moveTo(boxX, boxY + lineLen); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + lineLen, boxY); ctx.stroke();
        // Top Right
        ctx.beginPath(); ctx.moveTo(boxX + boxW, boxY + lineLen); ctx.lineTo(boxX + boxW, boxY); ctx.lineTo(boxX + boxW - lineLen, boxY); ctx.stroke();
        // Bottom Left
        ctx.beginPath(); ctx.moveTo(boxX, boxY + boxH - lineLen); ctx.lineTo(boxX, boxY + boxH); ctx.lineTo(boxX + lineLen, boxY + boxH); ctx.stroke();
        // Bottom Right
        ctx.beginPath(); ctx.moveTo(boxX + boxW, boxY + boxH - lineLen); ctx.lineTo(boxX + boxW, boxY + boxH); ctx.lineTo(boxX + boxW - lineLen, boxY + boxH); ctx.stroke();

        // 2. Render Vertical Laser Scanning Bar
        scanY += 2 * scanDirection;
        if (scanY > boxH || scanY < 0) {
          scanDirection *= -1;
        }
        
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(boxX, boxY + scanY);
        ctx.lineTo(boxX + boxW, boxY + scanY);
        ctx.stroke();

        // Add soft laser neon glow
        const glowGrad = ctx.createLinearGradient(boxX, boxY + scanY, boxX, boxY + scanY + (8 * scanDirection));
        glowGrad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
        glowGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(boxX, scanDirection === 1 ? boxY + scanY - 10 : boxY + scanY, boxW, 10);

        // 3. Map Simulated Facial Wireframe Nodes
        const nodes = relativeFaceNodes.map(node => ({
          ...node,
          x: boxX + (boxW * node.rx) + Math.sin(frameCount * 0.05 + node.ry * 10) * 2.5,
          y: boxY + (boxH * node.ry) + Math.cos(frameCount * 0.05 + node.rx * 10) * 2.5
        }));

        // Draw connections (triangulated mesh wires)
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
        ctx.lineWidth = 0.8;
        
        const drawLink = (n1, n2) => {
          if (n1 && n2) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        };

        // Draw mesh lines
        drawLink(nodes[0], nodes[1]); drawLink(nodes[0], nodes[2]);
        drawLink(nodes[1], nodes[3]); drawLink(nodes[2], nodes[3]);
        drawLink(nodes[1], nodes[5]); drawLink(nodes[2], nodes[6]);
        drawLink(nodes[3], nodes[4]);
        drawLink(nodes[4], nodes[5]); drawLink(nodes[4], nodes[6]);
        drawLink(nodes[5], nodes[7]); drawLink(nodes[6], nodes[8]);
        drawLink(nodes[7], nodes[8]);
        drawLink(nodes[7], nodes[9]); drawLink(nodes[8], nodes[9]);

        // Draw node points and display active float tracking coordinates
        nodes.forEach(node => {
          ctx.fillStyle = '#00f0ff';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Outer glowing ring
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6 + Math.sin(frameCount * 0.1) * 2, 0, Math.PI * 2);
          ctx.stroke();

          // Float coordinate labels (drawn in small mono text for technical HUD look)
          if (frameCount % 180 < 60 && (node.id === 'left-eye' || node.id === 'right-cheek' || node.id === 'chin')) {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
            ctx.font = '7px "Share Tech Mono"';
            const cx = (node.x * 1.05).toFixed(1);
            const cy = (node.y * 0.95).toFixed(1);
            ctx.fillText(`X:${cx} Y:${cy}`, node.x + 8, node.y - 2);
          }
        });

        // 4. Render Telemetry Info Boxes
        ctx.fillStyle = 'rgba(5, 7, 12, 0.7)';
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1;

        // Top Left Status Badge
        ctx.fillRect(10, 10, 140, 32);
        ctx.strokeRect(10, 10, 140, 32);
        ctx.fillStyle = '#00f0ff';
        ctx.font = '8px "Share Tech Mono"';
        ctx.fillText("SYS.NEURAL_MONITOR // V2.1", 16, 22);
        ctx.fillStyle = '#39ff14';
        ctx.font = '9px "Share Tech Mono"';
        ctx.fillText("STATUS: SCAN_ENGAGED", 16, 34);

        // Fluctuate biometrics telemetry slowly
        frameCount++;
        if (frameCount % 60 === 0) {
          mockPulse = Math.round(70 + Math.sin(frameCount * 0.01) * 3 + Math.random() * 2);
          mockFocus = Math.round(96 + Math.random() * 3);
          mockConfidence = Math.round(84 + Math.sin(frameCount * 0.05) * 5 + Math.random() * 2);

          const stressLvl = mockPulse > 76 ? 'MEDIUM' : 'LOW';
          
          setTelemetry({
            focus: mockFocus,
            stress: stressLvl,
            confidence: mockConfidence,
            pulseRate: mockPulse,
            blinkCount: Math.round(3 + Math.random() * 3)
          });

          // Send updates to parent controller
          if (onMetricUpdate) {
            onMetricUpdate({
              stressLevel: stressLvl,
              focusScore: mockFocus,
              confidenceScore: mockConfidence
            });
          }
        }
      }
      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => cancelAnimationFrame(animationId);
  }, [streamActive, onMetricUpdate]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-[rgba(0,240,255,0.15)] bg-slate-950/80">
      
      {/* Visual Canvas Feed */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
        {streamActive ? (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            />
            <canvas 
              ref={canvasRef} 
              width={480} 
              height={360} 
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1] z-10 pointer-events-none"
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center p-6">
            {cameraError ? (
              <>
                <AlertTriangle className="w-12 h-12 text-rose-500 animate-bounce" />
                <p className="text-slate-300 font-medium text-sm">
                  Webcam stream blocked. Please authorize camera permissions to enable AI face-mesh scanning and biometrics logs.
                </p>
                <button 
                  onClick={startCamera}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-rose-500 rounded-lg hover:bg-rose-400 transition cursor-pointer"
                >
                  Retry Camera Permissions
                </button>
              </>
            ) : (
              <>
                <CameraOff className="w-12 h-12 text-slate-500 animate-pulse" />
                <p className="text-slate-400 font-medium text-sm">Webcam is currently disabled.</p>
                <button 
                  onClick={startCamera}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  Activate Live Scanning
                </button>
              </>
            )}
          </div>
        )}

        {/* Ambient Neon Scan Bar overlay if active */}
        {streamActive && <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none" />}
      </div>

      {/* Telemetry Footer Diagnostics */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800/80 bg-slate-950/90 py-3 px-4 tech-mono text-xs">
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">FOCUS INDEX</span>
          <span className={`text-base font-extrabold mt-0.5 ${telemetry.focus > 97 ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {telemetry.focus}%
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
            STRESS DELTA
          </span>
          <span className={`text-base font-extrabold mt-0.5 ${telemetry.stress === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {telemetry.stress}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">CONFIDENCE</span>
          <span className="text-base font-extrabold mt-0.5 text-cyan-400">
            {telemetry.confidence}%
          </span>
        </div>
      </div>
      
      {streamActive && (
        <div className="absolute bottom-16 right-3 flex items-center gap-1 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[9px] tech-mono text-emerald-400 tracking-wider">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> FACE_DETECTION: ON
        </div>
      )}
    </div>
  );
}
