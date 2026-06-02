import React, { useState, useEffect, useRef } from "react";
import { Terminal, RefreshCw, Layers, ShieldCheck, Play, Pause } from "lucide-react";

export default function LogsDocker() {
  const [selectedContainer, setSelectedContainer] = useState<string>("all");
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  
  const terminalRef = useRef<HTMLDivElement>(null);

  const containerOptions = [
    { id: "all", label: "Todos os Containers", color: "border-[var(--brand-primary)]/40 text-[var(--brand-light)]" },
    { id: "chromadb", label: "ChromaDB (Vector DB)", color: "border-blue-500/40 text-blue-400" },
    { id: "n8n", label: "n8n (Orquestrador)", color: "border-pink-500/40 text-pink-400" },
    { id: "homeassistant", label: "Home Assistant (Core)", color: "border-teal-500/40 text-teal-400" },
    { id: "postgres", label: "PostgreSQL (Finance/Agenda)", color: "border-[var(--brand-primary)]/40 text-[var(--brand-light)]" },
    { id: "redis", label: "Redis (Mensageria Voz)", color: "border-red-500/40 text-red-500" }
  ];

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/docker/logs?container=${selectedContainer}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Erro ao carregar logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    let interval: NodeJS.Timeout | null = null;
    if (isLive) {
      interval = setInterval(() => {
        fetchLogs();
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedContainer, isLive]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs.length]);

  const triggerAction = async (action: string) => {
    if (action === "Pause Services (Hibernar)") {
      try {
        await fetch("/api/system/toggle", { method: "POST" });
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
      return;
    }
    
    setActionMessage(`[SISTEMA] Comando '${action}' disparado para o container '${selectedContainer}'...`);
    
    if (action === "Restart Container") {
      fetch("/api/docker/restart", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ containerName: selectedContainer })
      });
    }

    setTimeout(() => {
      setActionMessage(null);
      fetchLogs(); // refresh logs
    }, 2500);
  };

  return (
    <div className="bg-[#030712]/90 border border-zinc-900 rounded-2xl p-5 md:p-6 space-y-6">
      
      {/* Tab Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-sans font-semibold text-white tracking-tight flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[var(--brand-light)] animate-pulse" />
            Central de Logs do Docker (HUD Real-Time)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Monitore a saúde do ChromaDB, n8n, PostgreSQL e Redis rodando na máquina local. Aceleração CUDA e conexões de rede mapeadas.
          </p>
        </div>
        
        {/* Toggle live streaming */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer font-medium ${
              isLive 
                ? "bg-emerald-950/40 border border-emerald-500/40 text-emerald-400" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-500"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-500 animate-ping" : "bg-zinc-700"}`}></span>
            {isLive ? "[AUTO] Streaming Ativo" : "[PAUSADO] Logs Estáticos"}
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
            title="Recarregar Logs Agora"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[var(--brand-light)]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Selector pills */}
      <div className="flex flex-wrap gap-2">
        {containerOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedContainer(opt.id)}
            className={`px-3 py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
              selectedContainer === opt.id
                ? `bg-[var(--brand-primary)]/10 ${opt.color} font-bold shadow-[0_0_10px_rgba(6,182,212,0.05)]`
                : "bg-zinc-950/40 border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Terminal View */}
      <div className="relative">
        <div className="bg-black border border-zinc-850 rounded-xl overflow-hidden flex flex-col shadow-2xl relative">
          
          {/* Header of Terminal */}
          <div className="flex justify-between items-center bg-zinc-950 px-4 py-2 border-b border-zinc-850">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-[var(--brand-light)]" />
              docker logs -f --tail=100 {selectedContainer === "all" ? "suite_jarvis_containers" : `jarvis_${selectedContainer}`}
            </span>
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>

          {/* Logs scroll wrapper */}
          <div
            ref={terminalRef}
            className="p-5 font-mono text-xs leading-relaxed text-zinc-300 bg-black overflow-y-auto h-96 space-y-1 select-text scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {actionMessage && (
              <div className="text-yellow-400 font-semibold bg-yellow-950/30 p-2 border border-yellow-900/40 rounded mb-3 animate-pulse">
                {actionMessage}
              </div>
            )}

            {logs.length === 0 ? (
              <div className="text-zinc-600 italic h-full flex flex-col items-center justify-center space-y-2">
                <span>[INFO] Aguardando sinal do daemon do Docker compose local...</span>
                <span className="text-[10px]">A contagem de threads reiniciará em breve.</span>
              </div>
            ) : (
              logs.map((log, idx) => {
                let colorClass = "text-zinc-300";
                
                // Colorize logs based on context/container prefixes
                if (log.includes("[CHROMADB]")) colorClass = "text-blue-400 font-semibold";
                else if (log.includes("[N8N]")) colorClass = "text-pink-400 font-semibold";
                else if (log.includes("[HOMEASSISTANT]")) colorClass = "text-teal-400 font-semibold";
                else if (log.includes("[POSTGRES]")) colorClass = "text-[var(--brand-light)] font-semibold";
                else if (log.includes("[REDIS]")) colorClass = "text-red-400 font-semibold";

                // Highlight inner words for extra technical detail
                if (log.includes("SUCCESS") || log.includes("SUCCESSFULLY") || log.includes("SUCCESS") || log.includes("Concluído") || log.includes("synced!")) {
                  return (
                    <div key={idx} className={`${colorClass} hover:bg-zinc-950/60 py-0.5 rounded px-1 transition-colors whitespace-pre-wrap`}>
                      {log} <span className="text-emerald-400 font-bold">✓ DONE</span>
                    </div>
                  );
                }

                if (log.includes("ERROR") || log.includes("WARNING") || log.includes("failed")) {
                  return (
                    <div key={idx} className="text-rose-400 bg-rose-950/20 py-0.5 rounded px-1 animate-pulse border-l border-rose-600 whitespace-pre-wrap">
                      {log}
                    </div>
                  );
                }

                return (
                  <div key={idx} className={`${colorClass} hover:bg-zinc-950/60 py-0.5 rounded px-1 transition-colors whitespace-pre-wrap`}>
                    {log}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Floating Controls inside Terminal */}
        <div className="absolute top-12 right-4 flex gap-1.5 z-10">
          <button
            onClick={() => triggerAction("Restart Container")}
            className="px-2.5 py-1 text-[10px] font-mono bg-zinc-900 hover:bg-[var(--brand-dark)] border border-zinc-800 hover:border-[var(--brand-primary)]/50 text-[var(--brand-light)] rounded transition cursor-pointer"
          >
            Restart
          </button>
          <button
            onClick={() => triggerAction("Pause Services (Hibernar)")}
            className="px-2.5 py-1 text-[10px] font-mono bg-zinc-900 hover:bg-red-950 border border-zinc-800 hover:border-red-500/50 text-red-400 rounded transition cursor-pointer"
          >
            Pausecompose
          </button>
        </div>
      </div>

      {/* Help metadata context */}
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2.5 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Monitorando subnet interna do docker do desktop na rede pessoal Windows WSL2 host bridge.</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          Docker Subnet: 172.18.0.0/16
        </span>
      </div>

    </div>
  );
}
