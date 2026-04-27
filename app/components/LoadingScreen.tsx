"use client";

import { useEffect, useRef, useState } from "react";

const TERMINAL_MESSAGES = [
  "INITIALIZING COMX_SYSTEM_v2.0...",
  "BYPASSING ACADEMIC FIREWALLS...",
  "ESTABLISHING SECURE HANDSHAKE...",
  "DECRYPTING PEER-TO-PEER CHANNELS...",
  "COMX ACCESS GRANTED."
];

export default function LoadingScreen({ onFinished }: { onFinished: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [nodeId, setNodeId] = useState("");

  useEffect(() => {
    setNodeId(Math.random().toString(16).substring(2, 10).toUpperCase());
  }, []);

  // Matrix Rain Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();

    const chars = "0123456789ABCDEF"; 
    const charSize = 16;
    const columns = Math.floor(canvas.width / charSize);
    const drops: number[] = Array(columns).fill(0);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#6366f1";
      ctx.font = `bold ${charSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * charSize, drops[i] * charSize);

        if (drops[i] * charSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 40);
    window.addEventListener("resize", updateSize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Terminal and Progress Sequence
  useEffect(() => {
    if (currentMessageIndex < TERMINAL_MESSAGES.length) {
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, TERMINAL_MESSAGES[currentMessageIndex]]);
        setCurrentMessageIndex(prev => prev + 1);
        setProgress((prev) => Math.min(100, prev + (100 / TERMINAL_MESSAGES.length)));
      }, 800);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onFinished, 800);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, onFinished]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050507] flex flex-col items-center justify-center font-mono overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" 
      />
      
      <div className="relative z-10 w-full max-w-lg px-8 animate-fade-in">
        <div className="mb-10 flex flex-col items-center">
           <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center animate-glitch shadow-[0_0_40px_rgba(99,102,241,0.4)] border border-indigo-400/30">
             <span className="text-4xl font-black text-white">X</span>
           </div>
           <h1 className="mt-6 text-4xl font-black tracking-tighter text-white">
             COMX<span className="text-indigo-500">_SYSTEM</span>
           </h1>
           <div className="mt-2 text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">
             Access Protocol Activated
           </div>
        </div>

        <div className="glass-card p-8 border-indigo-500/20 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
            </div>
            <span className="text-[10px] text-indigo-400 font-black tracking-widest">{Math.round(progress)}% LOADED</span>
          </div>

          <div className="space-y-2 h-32 overflow-hidden">
            {messages.map((msg, i) => (
              <div key={i} className="flex space-x-3 text-sm animate-slide-in">
                <span className="text-indigo-500 font-black opacity-50">#</span>
                <span className={i === messages.length - 1 ? "text-white font-bold" : "text-white/40"}>
                   {msg}
                </span>
              </div>
            ))}
            {currentMessageIndex < TERMINAL_MESSAGES.length && (
               <div className="flex space-x-3 text-sm">
                 <span className="text-indigo-500 font-black opacity-50 animate-pulse">{">"}</span>
                 <span className="w-2 h-4 bg-indigo-500 animate-blink"></span>
               </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/10 w-full">
            <div 
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center opacity-30">
           <p className="text-[9px] text-white uppercase tracking-[0.3em] font-black">
             Encrypted Handshake Node: {nodeId}
           </p>
        </div>
      </div>
    </div>
  );
}
