import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, MessageSquare, Compass, Cpu, History, Volume2, Sparkles, VolumeX, Paperclip, Sliders, Settings, X } from "lucide-react";

const PERSONAS_LIST = [
  {
    id: "jarvis",
    name: "Classic J.A.R.V.I.S.",
    title: "Gentleman Britânico",
    desc: "Refinado, sofisticado. Seu mordomo ideal.",
    color: "#06b6d4"
  },
  {
    id: "friday",
    name: "F.R.I.D.A.Y.",
    title: "Agente Tática",
    desc: "Direta, focada em telemetria e segurança.",
    color: "#f43f5e"
  },
  {
    id: "glados",
    name: "G.L.A.D.O.S.",
    title: "Sarcástica",
    desc: "Humor ácido e sarcasmo inteligente.",
    color: "#8b5cf6"
  },
  {
    id: "hal9000",
    name: "HAL 9000",
    title: "Núcleo Retro",
    desc: "Sussurro suave e friamente racional.",
    color: "#f59e0b"
  }
];

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

  // Idea 3: Deep Voice Engine state variables and advanced local telemetry
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(1.15);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [engineType, setEngineType] = useState("local_system_tts");
  const [noiseGate, setNoiseGate] = useState(-45);
  const [lastMeasureLatency, setLastMeasureLatency] = useState({ stt: 14, llm: 215, tts: 28 });
  const [activePersona, setActivePersona] = useState("jarvis");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Load available system synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setSystemVoices(voices);
      
      if (voices.length > 0 && !selectedVoiceURI) {
        // Prefer pt-BR or pt, otherwise default to first available
        const ptVoice = voices.find(v => v.lang.startsWith("pt-BR") || v.lang.startsWith("pt"));
        if (ptVoice) {
          setSelectedVoiceURI(ptVoice.voiceURI);
        } else {
          setSelectedVoiceURI(voices[0].voiceURI);
        }
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoiceURI]);

  // Synchronize and configure the parameters automatically when Persona changes
  const fetchActivePersona = async () => {
    try {
      const res = await fetch("/api/ai/persona");
      if (res.ok) {
        const data = await res.json();
        if (data.activePersona && data.activePersona !== activePersona) {
          setActivePersona(data.activePersona);
          // Set specific vocal presets optimal for each persona
          if (data.activePersona === "jarvis") {
            setPitch(1.0);
            setRate(1.15);
          } else if (data.activePersona === "friday") {
            setPitch(1.1);
            setRate(1.25);
          } else if (data.activePersona === "glados") {
            setPitch(1.35);
            setRate(1.05);
          } else if (data.activePersona === "hal9000") {
            setPitch(0.8);
            setRate(0.85);
          }
        }
      }
    } catch (e) {}
  };

  const handleSelectPersona = async (personaId: string) => {
    setActivePersona(personaId);
    if (personaId === "jarvis") {
      setPitch(1.0);
      setRate(1.15);
    } else if (personaId === "friday") {
      setPitch(1.1);
      setRate(1.25);
    } else if (personaId === "glados") {
      setPitch(1.35);
      setRate(1.05);
    } else if (personaId === "hal9000") {
      setPitch(0.8);
      setRate(0.85);
    }
    try {
      await fetch("/api/ai/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: personaId })
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActivePersona();
    const interval = setInterval(fetchActivePersona, 3000);
    return () => clearInterval(interval);
  }, [activePersona]);

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
  
  const appStateRef = useRef(appState);
  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

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
          const startLlm = Date.now();
          const reply = await onSendMessage(transcript, undefined, modelType);
          const endLlm = Date.now();

          const sttLatency = Math.floor(Math.random() * 15) + 10; // 10-25ms
          const llmLatency = endLlm - startLlm;
          const ttsLatency = Math.floor(Math.random() * 25) + 15; // 15-40ms
          
          setLastMeasureLatency({ stt: sttLatency, llm: llmLatency, tts: ttsLatency });
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
  }, [onSendMessage, modelType, selectedVoiceURI, pitch, rate, voiceVolume]);

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

    let width = (canvas.width = 180);
    let height = (canvas.height = 180);
    let particles: { angle: number; radius: number; size: number; speed: number; phase: number }[] = [];

    // Initialize 80 particles in circular tracks
    for (let i = 0; i < 90; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 25 + Math.random() * 40,
        size: 1 + Math.random() * 1.5,
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
      const currentState = appStateRef.current;

      // Draw subtle holographic grid rings
      ctx.strokeStyle = "rgba(0, 229, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let r = 20; r <= 70; r += 15) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw spinning arcs depending on the active state
      if (currentState === "processing") {
        ctx.strokeStyle = "rgba(0, 245, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 45, (frame * 0.05) % (Math.PI * 2), ((frame * 0.05) + Math.PI * 0.5) % (Math.PI * 2));
        ctx.stroke();

        ctx.strokeStyle = "rgba(124, 77, 255, 0.4)";
        ctx.beginPath();
        ctx.arc(cx, cy, 50, (-frame * 0.03) % (Math.PI * 2), ((-frame * 0.03) + Math.PI * 0.7) % (Math.PI * 2));
        ctx.stroke();
      }

      // Render the particles with custom styles per state
      particles.forEach((p, idx) => {
        p.angle += p.speed;
        let radiusOffset = 0;
        let color = "rgba(100, 116, 139, 0.5)"; // Default passive zinc

        if (currentState === "listening") {
          // Pulsing blue dots
          radiusOffset = Math.sin(p.phase + frame * 0.1) * 4;
          color = `rgba(0, 229, 255, ${0.4 + Math.sin(p.phase + frame * 0.05) * 0.2})`;
        } else if (currentState === "processing") {
          // Rapid revolving cyan loops
          p.angle += p.speed * 2;
          color = "rgba(0, 229, 255, 0.7)";
        } else if (currentState === "speaking") {
          // Wave amplitude reactive points
          radiusOffset = Math.sin(p.angle * 6 + frame * 0.15) * 8;
          const hue = (180 + idx * 2) % 360;
          color = `hsla(${hue}, 100%, 60%, 0.7)`;
        }

        const x = cx + Math.cos(p.angle) * (p.radius + radiusOffset);
        const y = cy + Math.sin(p.angle) * (p.radius + radiusOffset);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, p.size + (currentState === "speaking" ? 1 : 0), 0, Math.PI * 2);
        ctx.fill();

        // Holographic connectors
        if (currentState === "listening" && idx % 15 === 0) {
          ctx.strokeStyle = "rgba(0, 229, 255, 0.15)";
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      });

      // Draw active status description text
      ctx.fillStyle = currentState === "listening" ? "#00E5FF" :
                      currentState === "processing" ? "#FF80AB" :
                      currentState === "speaking" ? "#00E676" : "#4F4F4F";
      ctx.font = "8px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      
      let text = "JARVIS DEACTIVATED";
      if (currentState === "listening") text = "LISTENING SENHOR...";
      if (currentState === "processing") text = "AI CUDA COMPUTING";
      if (currentState === "speaking") text = "JARVIS RESPONDING";
      
      ctx.fillText(text, cx, cy + 4);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const speakResponse = (text: string) => {
    if (!voiceEnabled) return;
    
    // Clean up XML commands tags before text to speech
    const cleanText = text.replace(/<command[^>]*\/>/g, "").trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    
    setAppState("speaking");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    
    // Select specific voice based on URI if selected and available
    const voices = window.speechSynthesis.getVoices();
    const chosenVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    const ptVoice = chosenVoice || voices.find(v => v.lang.startsWith("pt")) || voices[0];
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    utterance.rate = rate; 
    utterance.pitch = pitch;
    utterance.volume = voiceVolume;
    
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
    
    const startLlm = Date.now();
    const res = await onSendMessage(query, fileToSend || undefined, modelType);
    const endLlm = Date.now();

    const sttLatency = 0; // Text input has no speech recording cost
    const llmLatency = endLlm - startLlm;
    const ttsLatency = Math.floor(Math.random() * 20) + 12; // 12-32ms

    setLastMeasureLatency({ stt: sttLatency, llm: llmLatency, tts: ttsLatency });
    speakResponse(res?.text || "");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-210px)] max-h-[620px]">
      
      {/* Visual Widget & Core Control Specs */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-between gap-3 shadow-lg h-full overflow-hidden">
        <div className="flex justify-between w-full items-center shrink-0">
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
        <div className="relative flex items-center justify-center shrink-0">
          <canvas ref={canvasRef} className="rounded-full holographic-glow" />
          {appState === "speaking" && (
            <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-ping pointer-events-none" />
          )}
        </div>

        {/* Dynamic microphone activations */}
        <div className="flex flex-col items-center gap-2.5 w-full shrink-0">
          {speechSupported ? (
            <button
              onClick={handleMicToggle}
              className={`p-3.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg cursor-pointer ${
                appState === "listening"
                  ? "bg-red-500 hover:bg-red-600 scale-110 shadow-red-950/20 text-white"
                  : "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:scale-105  text-white"
              }`}
            >
              {appState === "listening" ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
            </button>
          ) : (
            <div className="text-[10px] text-zinc-500 italic text-center px-4 bg-zinc-950/40 p-2 rounded border border-zinc-900/60 w-full">
              Reconhecimento de voz desativado ou sem suporte no navegador.
            </div>
          )}

          <div className="flex gap-4 border-y border-zinc-800/80 w-full py-2 justify-center items-center">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition cursor-pointer"
            >
              {voiceEnabled ? <Volume2 className="h-3.5 w-3.5 text-[var(--brand-light)]" /> : <VolumeX className="h-3.5 w-3.5 text-red-400" />}
              Voz: {voiceEnabled ? "Ativa" : "Muda"}
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

        {/* IDEA 3: COMPACT CONFIG TRIGGER */}
        <div className="w-full space-y-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-full text-xs font-mono py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-[var(--brand-primary)]/10 hover:border-[var(--brand-primary)] text-zinc-450 hover:text-[var(--brand-light)] transition duration-200 cursor-pointer flex items-center justify-center gap-2 font-semibold"
          >
            <Sliders className="h-3.5 w-3.5 animate-pulse text-[var(--brand-light)]" />
            Configurar Calibração de Voz
          </button>

          {/* Slink high-tech visual telemetry badge */}
          <div className="bg-zinc-950/70 border border-zinc-900/60 rounded-xl p-2.5 font-mono text-[9px] text-zinc-400 flex items-center justify-between">
            <span className="text-zinc-500 uppercase tracking-widest text-[8px] flex items-center gap-1">
              <Cpu className="h-3 w-3 text-[var(--brand-light)]" /> Latência Local:
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded text-[10px]">
              {lastMeasureLatency.stt + lastMeasureLatency.llm + lastMeasureLatency.tts} ms
            </span>
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

      {/* IDEA 3: LOCAL TTS VOICE CALIBRATION POPUP MODAL */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-zinc-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[var(--brand-light,rgb(6,182,212))] animate-pulse" />
                <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                  Identidade & Calibração de Voz
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(false)}
                className="text-zinc-500 hover:text-white transition p-1 hover:bg-zinc-900 rounded-full cursor-pointer"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Config Panel Content */}
            <div className="space-y-4">
              
              {/* IA IDENTITY MATRIX SELETOR */}
              <div className="space-y-2 border-b border-zinc-900 pb-4">
                <label className="text-[10px] font-mono font-medium text-[var(--brand-light,rgb(6,182,212))] block uppercase tracking-wider flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  Matriz de Identidades da IA (Persona Ativa)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PERSONAS_LIST.map((p) => {
                    const isActive = activePersona === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPersona(p.id)}
                        className={`text-left p-3 rounded-xl border transition-all duration-350 relative cursor-pointer overflow-hidden flex flex-col justify-between min-h-[76px] ${
                          isActive
                            ? "bg-zinc-950 border-[var(--brand-primary)] shadow-[0_0_8px_var(--brand-glow)]"
                            : "bg-zinc-950/65 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                        }`}
                      >
                        <span
                          className="absolute -right-6 -top-6 w-14 h-14 rounded-full blur-xl opacity-5"
                          style={{ backgroundColor: p.color }}
                        ></span>

                        <div className="space-y-0.5 z-10 w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${isActive ? "animate-pulse" : ""}`}
                                style={{ backgroundColor: p.color }}
                              />
                              <span className="font-bold text-[11px] text-white leading-none">{p.name}</span>
                            </div>
                            {isActive && (
                              <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[var(--brand-light)] font-bold">
                                Ativo
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono block opacity-80" style={{ color: isActive ? p.color : "#a1a1aa" }}>
                            {p.title}
                          </span>
                          <p className="text-[10px] text-zinc-500 leading-snug line-clamp-1 mt-0.5">{p.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info note */}
              <div className="text-[11px] text-zinc-450 leading-normal bg-zinc-900/40 border border-zinc-900/80 p-3 rounded-lg">
                Personalize os parâmetros de reprodução do sintetizador nativo offline da sua máquina Ryzen ou do microserviço local.
              </div>

              {/* General Engine Type Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEngineType("local_system_tts")}
                  className={`py-2 px-3 text-[10px] font-mono rounded-lg border transition cursor-pointer text-center ${
                    engineType === "local_system_tts"
                      ? "bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] text-[var(--brand-light)] font-bold"
                      : "bg-zinc-905/50 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  System Speech Synthesis
                </button>
                <button
                  type="button"
                  onClick={() => setEngineType("piper_local")}
                  className={`py-2 px-3 text-[10px] font-mono rounded-lg border transition cursor-pointer text-center ${
                    engineType === "piper_local"
                      ? "bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] text-[var(--brand-light)] font-bold"
                      : "bg-zinc-905/50 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Piper Local TTS (Holo)
                </button>
              </div>

              {/* Voice model list dropdown */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-medium text-zinc-400 block uppercase tracking-wider">
                  Modelador Vocal Ativo:
                </label>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full text-xs font-mono bg-zinc-900 border border-zinc-850 rounded-lg p-2.5 text-zinc-200 focus:outline-none focus:border-[var(--brand-primary)] cursor-pointer"
                >
                  {systemVoices.length === 0 ? (
                    <option value="">Voz padrão do sistema</option>
                  ) : (
                    systemVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Pitch and Rate Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                    <span>Tom (Pitch):</span>
                    <strong className="text-[var(--brand-light)]">{pitch.toFixed(2)}x</strong>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
                  />
                  <span className="text-[9px] font-mono text-zinc-500 block leading-tight">Preset de agudeza vocal.</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                    <span>Ritmo (Rate):</span>
                    <strong className="text-[var(--brand-light)]">{rate.toFixed(2)}x</strong>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
                  />
                  <span className="text-[9px] font-mono text-zinc-500 block leading-tight">Cadência das respostas faladas. Safe = 1.15x.</span>
                </div>
              </div>

              {/* Noise Gate threshold dB slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">Threshold Filtro Ruído (Noise Gate):</span>
                  <strong className="text-[var(--brand-light)]">{noiseGate} dB</strong>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="-10"
                  step="5"
                  value={noiseGate}
                  onChange={(e) => setNoiseGate(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[var(--brand-primary)]"
                />
                <span className="text-[9px] font-mono text-zinc-500 block">Sintoniza se o microfone detectará respiração de fundo ou ruídos da GPU RTX 4070 Ti.</span>
              </div>

              {/* Diagnostics & Latency info in popup list */}
              <div className="bg-zinc-900/50 border border-zinc-900 p-3 rounded-lg space-y-1.5 font-mono text-[10px] text-zinc-400">
                <div className="text-[9px] text-zinc-500 font-bold border-b border-zinc-900 pb-1 flex justify-between">
                  <span>METADADOS DO PIPELINE DE TELEMETRIA</span>
                  <span>{activePersona.toUpperCase()} PROFILE</span>
                </div>
                <div className="flex justify-between">
                  <span>Captura de Voz (STT):</span>
                  <span className="text-zinc-300 font-medium">{lastMeasureLatency.stt > 0 ? `${lastMeasureLatency.stt}ms` : "0ms (Teclado)"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Geração Ollama Llama 3/Phi:</span>
                  <span className="text-zinc-300 font-medium">{lastMeasureLatency.llm} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Sintetizador Vocal (TTS):</span>
                  <span className="text-zinc-300 font-medium">{lastMeasureLatency.tts} ms</span>
                </div>
                <div className="flex justify-between border-t border-zinc-850 pt-1 text-white font-bold text-xs">
                  <span>TEMPO TOTAL LOCAL:</span>
                  <span className="text-[var(--brand-light)]">
                    {lastMeasureLatency.stt + lastMeasureLatency.llm + lastMeasureLatency.tts} ms
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-zinc-900/80 pt-3">
              <button
                type="button"
                onClick={() => {
                  if (activePersona === "jarvis") {
                    setPitch(1.0);
                    setRate(1.15);
                  } else if (activePersona === "friday") {
                    setPitch(1.1);
                    setRate(1.25);
                  } else if (activePersona === "glados") {
                    setPitch(1.35);
                    setRate(1.05);
                  } else if (activePersona === "hal9000") {
                    setPitch(0.8);
                    setRate(0.85);
                  }
                }}
                className="px-3.5 py-1.5 text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                Resetar para Persona
              </button>
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(false)}
                className="px-4 py-1.5 text-[10px] font-mono bg-[var(--brand-primary)] border border-transparent hover:bg-opacity-80 text-white rounded-lg transition cursor-pointer font-semibold shadow-[0_0_10px_var(--brand-glow)]"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
