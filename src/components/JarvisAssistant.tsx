import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, MessageSquare, Compass, Cpu, History, Volume2, Sparkles, VolumeX, Paperclip } from "lucide-react";

interface JarvisAssistantProps {
  conversations: any[];
  onSendMessage: (msg: string, file?: any, model?: string) => Promise<any>;
}

export default function JarvisAssistant({ conversations, onSendMessage }: JarvisAssistantProps) {
  const [inputText, setInputText] = useState("");
  const [appState, setAppState] = useState<"inactive" | "listening" | "processing" | "speaking">("inactive");
  const [modelType, setModelType] = useState("llama3.1");
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; size: number; content?: string } | null>(null);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const triggerInteractionDateCheck = () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastInteractedDate = localStorage.getItem("jarvis_last_interact_date");
      if (lastInteractedDate !== todayStr) {
        setShowNotePopup(true);
        localStorage.setItem("jarvis_last_interact_date", todayStr);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Global Keyboard Shortcuts (Modo 2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Space
      if (e.ctrlKey && e.code === "Space") {
        e.preventDefault();
        handleMicToggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appState]);

  // Initialize Speech Recognition & Speech Synthesis
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = "pt-BR";
      rec.interimResults = false;

      rec.onstart = () => {
        setAppState("listening");
      };

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          setAppState("processing");
          const reply = await onSendMessage(transcript, undefined, modelType);
          speakResponse(reply?.text || "");
        } else {
          setAppState("inactive");
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setAppState("inactive");
      };

      rec.onend = () => {
        // Only return to inactive if we didn't initiate processing/speaking
        setAppState((prev) => (prev === "listening" ? "inactive" : prev));
      };

      recognitionRef.current = rec;
    }
  }, [onSendMessage, modelType]);

  // Scroll to bottom of conversation
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations.length]);

  // Animated canvas circles resembling Tony Stark's HUD
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = 300);
    let height = (canvas.height = 300);
    let particles: { angle: number; radius: number; size: number; speed: number; phase: number }[] = [];

    // Initialize 80 particles in circular tracks
    for (let i = 0; i < 90; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 40 + Math.random() * 60,
        size: 1 + Math.random() * 2,
        speed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      // Draw subtle holographic grid rings
      ctx.strokeStyle = "rgba(0, 229, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let r = 30; r <= 110; r += 25) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw spinning arcs depending on the active state
      if (appState === "processing") {
        ctx.strokeStyle = "rgba(0, 245, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 75, (frame * 0.05) % (Math.PI * 2), ((frame * 0.05) + Math.PI * 0.5) % (Math.PI * 2));
        ctx.stroke();

        ctx.strokeStyle = "rgba(124, 77, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(cx, cy, 80, (-frame * 0.03) % (Math.PI * 2), ((-frame * 0.03) + Math.PI * 0.7) % (Math.PI * 2));
        ctx.stroke();
      }

      // Render the particles with custom styles per state
      particles.forEach((p, idx) => {
        p.angle += p.speed;
        let radiusOffset = 0;
        let color = "rgba(100, 116, 139, 0.5)"; // Default passive zinc

        if (appState === "listening") {
          // Pulsing blue dots
          radiusOffset = Math.sin(p.phase + frame * 0.1) * 6;
          color = `rgba(0, 229, 255, ${0.4 + Math.sin(p.phase + frame * 0.05) * 0.2})`;
        } else if (appState === "processing") {
          // Rapid revolving cyan loops
          p.angle += p.speed * 2;
          color = "rgba(0, 229, 255, 0.7)";
        } else if (appState === "speaking") {
          // Wave amplitude reactive points
          radiusOffset = Math.sin(p.angle * 6 + frame * 0.15) * 12;
          const hue = (180 + idx * 2) % 360;
          color = `hsla(${hue}, 100%, 60%, 0.7)`;
        }

        const x = cx + Math.cos(p.angle) * (p.radius + radiusOffset);
        const y = cy + Math.sin(p.angle) * (p.radius + radiusOffset);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, p.size + (appState === "speaking" ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();

        // Holographic connectors
        if (appState === "listening" && idx % 15 === 0) {
          ctx.strokeStyle = "rgba(0, 229, 255, 0.15)";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

      // Draw active status description text
      ctx.fillStyle = appState === "listening" ? "#00E5FF" :
                      appState === "processing" ? "#FF80AB" :
                      appState === "speaking" ? "#00E676" : "#4F4F4F";
      ctx.font = "10px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      
      let text = "JARVIS DEACTIVATED";
      if (appState === "listening") text = "LISTENING SENHOR...";
      if (appState === "processing") text = "AI CUDA COMPUTING";
      if (appState === "speaking") text = "JARVIS RESPONDING";
      
      ctx.fillText(text, cx, cy + 5);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [appState]);

  const speakResponse = (text: string) => {
    if (!voiceEnabled) return;
    
    // Clean up XML commands tags before text to speech
    const cleanText = text.replace(/<command[^>]*\/>/g, "").trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    
    setAppState("speaking");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    
    // Attempt to select a nice Portuguese voice if available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt")) || voices[0];
    if (ptVoice) utterance.voice = ptVoice;
    
    utterance.rate = 1.1; // Slightly faster for butler refinement
    
    utterance.onend = () => {
      setAppState("inactive");
    };
    
    utterance.onerror = () => {
      setAppState("inactive");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleMicToggle = () => {
    triggerInteractionDateCheck();
    if (appState === "listening") {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel();
      recognitionRef.current?.start();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerInteractionDateCheck();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        content: event.target?.result as string || ""
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerInteractionDateCheck();
    if (!inputText.trim() && !attachedFile) return;

    const query = inputText || `Processar anexo ${attachedFile?.name}`;
    const fileToSend = attachedFile;

    setInputText("");
    setAttachedFile(null);
    setAppState("processing");
    
    const res = await onSendMessage(query, fileToSend || undefined, modelType);
    setAppState("speaking");
    speakResponse(res?.text || "");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-210px)] max-h-[620px]">
      
      {/* Visual Widget & Core Control Specs */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-between shadow-lg">
        <div className="flex justify-between w-full items-center">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5 text-[var(--brand-light)]" />
            GPU CUDA VRAM
          </span>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-1 rounded focus:outline-none focus:border-[var(--brand-primary)]"
          >
            <option value="llama3.1">Llama 3.1 (8B) Q4 (Fast)</option>
            <option value="phi3">Phi-3 Mini (3.8B)</option>
            <option value="llama3.1">Llama 3.1 8B (Heavy)</option>
          </select>
        </div>

        {/* Visual Sphere matrix */}
        <div className="relative my-4 flex items-center justify-center">
          <canvas ref={canvasRef} className="rounded-full holographic-glow" />
          {appState === "speaking" && (
            <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-ping pointer-events-none" />
          )}
        </div>

        {/* Dynamic microphone activations */}
        <div className="flex flex-col items-center gap-3 w-full">
          {speechSupported ? (
            <button
              onClick={handleMicToggle}
              className={`p-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                appState === "listening"
                  ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-950/20 text-white"
                  : "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:scale-105  text-white"
              }`}
            >
              {appState === "listening" ? <MicOff className="h-6 w-6 animate-pulse" /> : <Mic className="h-6 w-6" />}
            </button>
          ) : (
            <div className="text-[10px] text-zinc-500 italic text-center px-4 bg-zinc-950/40 p-2 rounded border border-zinc-900/60">
              Reconhecimento de voz não suportado neste navegador. Digite comandos pelo terminal abaixo.
            </div>
          )}

          <div className="flex gap-4 border-t border-zinc-800/80 w-full pt-4 justify-center items-center">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition cursor-pointer"
            >
              {voiceEnabled ? <Volume2 className="h-3.5 w-3.5 text-[var(--brand-light)]" /> : <VolumeX className="h-3.5 w-3.5 text-red-400" />}
              Voz: {voiceEnabled ? "Mutt" : "Mudo"}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <History className="h-3.5 w-3.5" />
              Histórico
            </button>
          </div>
        </div>
      </div>

      {/* Terminal Interative Chat & Console log */}
      <div className="lg:col-span-2 bg-black/90 border border-zinc-800 rounded-xl flex flex-col justify-between overflow-hidden shadow-2xl h-full relative">
        {/* Terminal Header */}
        <div className="flex justify-between items-center bg-zinc-900/80 px-4 py-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[var(--brand-light)] animate-pulse"></div>
            <span className="text-zinc-200 text-xs font-mono font-medium">CONSOLE@JARVIS_v5.0:~</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
            {modelType === "llama3.1" ? "LOCAL_MODEL=Llama 3.1 (8B)-Q4" : modelType === "phi3" ? "LOCAL_MODEL=Phi3-Mini" : "LOCAL_MODEL=Llama-3.1-8B"}
          </span>
        </div>

        {/* Dialogue Scroll area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 select-text scrollbar-thin scrollbar-thumb-zinc-850">
          {conversations.map((msg, index) => {
            const isJarvis = msg.sender === "JARVIS";
            // Clean XML command nodes for rendering beautiful buttons or logs in dialogue instead of clutter
            const commandMatches = msg.text.match(/<command[^>]*\/>/g);
            let displayContent = msg.text.replace(/<command[^>]*\/>/g, "").trim();

            return (
              <div key={index} className={`flex gap-3 ${isJarvis ? "justify-start" : "justify-end"}`}>
                {isJarvis && (
                  <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-light)] flex-shrink-0 font-bold text-xs">
                    J
                  </div>
                )}
                <div className="max-w-[80%] flex flex-col gap-1.5">
                  <div
                    className={`px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                      isJarvis
                        ? "bg-zinc-900/80 text-zinc-100 border border-zinc-850"
                        : "bg-[var(--brand-dark)] text-[var(--brand-light)] border border-[var(--brand-border)]"
                    }`}
                  >
                    <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                  </div>

                  {/* Actions / Trigger visual nodes parsed from XML commands */}
                  {commandMatches && (
                    <div className="flex flex-wrap gap-1.5 mt-1 font-mono">
                      {commandMatches.map((cmd: string, idx: number) => {
                        const typeMatch = cmd.match(/type="([^"]+)"/);
                        const actionMatch = cmd.match(/action="([^"]+)"/);
                        const workMatch = cmd.match(/workspace="([^"]+)"/);
                        
                        const type = typeMatch ? typeMatch[1] : "Sistema";
                        const target = actionMatch ? actionMatch[1] : workMatch ? workMatch[1] : "Geral";

                        return (
                          <div
                            key={idx}
                            className="text-[10px] bg-[var(--brand-dark)] border border-[var(--brand-primary)]/30 text-[var(--brand-light)] px-2 py-1 rounded flex items-center gap-1 bg-opacity-40 animate-pulse"
                          >
                            <Sparkles className="h-3 w-3 shrink-0" />
                            <span>EXEC: [{type}] → {target} Amortizado</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <span className="text-[9px] text-zinc-500 self-end font-mono">
                    {new Date(msg.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={historyEndRef} />
        </div>

        {/* Smart dismissible pop-up banner */}
        {showNotePopup && (
          <div className="mx-4 mb-3 p-3.5 bg-zinc-950/95 border border-[var(--brand-primary)]/35 rounded-lg shadow-2xl backdrop-blur-md z-10 animate-in fade-in slide-in-from-bottom-2 duration-300 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-2.5 text-xs">
                <Sparkles className="h-4 w-4 text-[var(--brand-light)] shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <span className="font-semibold text-white font-sans block">Dica de Otimização Offline</span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    Anexos de documentos (<strong>PDF</strong>, <strong>DOCX</strong>, <strong>Excel</strong>) funcionam idealmente com a inteligência <strong className="text-white">Llama 3.1 8B (Heavy)</strong>. Ela possui a melhor capacidade semântica para ler tabelas, faturas de gastos e cronogramas de agenda offline!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNotePopup(false)}
                className="text-zinc-500 hover:text-white transition p-1 hover:bg-zinc-900 rounded font-mono text-xs leading-none shrink-0 cursor-pointer"
                title="Fechar nota"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Attachment preview if any file is attached */}
        {attachedFile && (
          <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-[var(--brand-light,rgb(6,182,212))]">
              <Paperclip className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px] truncate max-w-[280px]">{attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="text-zinc-500 hover:text-red-400 font-mono text-[10px] uppercase cursor-pointer"
            >
              [Remover]
            </button>
          </div>
        )}

        {/* Input prompt area */}
        <form onSubmit={handleSendText} className="p-3 border-t border-zinc-850 bg-zinc-950/80 flex gap-2 shrink-0 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.xlsx,.xls,.txt"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => {
              triggerInteractionDateCheck();
              fileInputRef.current?.click();
            }}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[var(--brand-light,rgb(6,182,212))] rounded-lg transition border border-zinc-800 flex items-center justify-center cursor-pointer"
            title="Anexar documento (PDF, DOCX, Excel)"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => triggerInteractionDateCheck()}
            disabled={appState === "processing"}
            placeholder={
              appState === "listening"
                ? "Diga algo..."
                : appState === "processing"
                ? "Processando..."
                : attachedFile
                ? "Descreva o que deseja atualizar ou dê Enter para anexar..."
                : "Digite o comando ou anexe planilhas, PDFs da rotina..."
            }
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white px-3.5 py-2.5 focus:outline-none focus:border-[var(--brand-primary)] transition-colors placeholder:text-zinc-500"
          />
          <button
            type="submit"
            disabled={appState === "processing" || (!inputText.trim() && !attachedFile)}
            className="px-4 py-2.5 bg-gradient-to-r from-[var(--brand-primary)] to-blue-600 hover:from-[var(--brand-primary)] hover:to-blue-500 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
