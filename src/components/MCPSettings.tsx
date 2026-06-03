import React, { useState } from "react";
import { Server, Folder, Github, Database, Play, CheckCircle } from "lucide-react";

export default function MCPSettings() {
  const [servers, setServers] = useState([
    { id: "fs", name: "Sistema de Arquivos Local", desc: "Permite que a IA leia arquivos .txt, pdfs ou projetos do seu disco local de forma padronizada.", active: true },
    { id: "github", name: "Integração GitHub Host", desc: "Permite que a IA liste seus repositórios, abra PRs e revise código usando suas credenciais locais.", active: false },
    { id: "db", name: "Acesso PostgreSQL Nativo", desc: "Fornece metadados do schema e permite que a IA crie queries seguras atreladas ao banco em execução no Docker.", active: false },
  ]);

  const toggleServer = (id: string) => {
    setServers(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="bg-[#030712]/90 border border-zinc-900 rounded-2xl p-5 md:p-8 space-y-6">
      <div className="flex justify-between items-start border-b border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-sans font-semibold text-white tracking-tight flex items-center gap-2">
            <Server className="h-5 w-5 text-[var(--brand-light)]" />
            Servidores MCP (Model Context Protocol) 
          </h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
            Em vez de construir centenas de ferramentas isoladas, ative Servidores MCP Locais. Eles padronizam como a LLM (Llama 3.1) se conecta a programas, bases de dados e arquivos locais sem necessidade de gambiarras. 
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {servers.map(server => (
           <div key={server.id} className={`border rounded-xl p-5 transition-all ${server.active ? 'border-[var(--brand-primary)] bg-[var(--brand-glow)]' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'}`}>
             <div className="flex justify-between items-start mb-4">
               <div className={`p-2 rounded-lg ${server.active ? 'bg-[var(--brand-primary)]' : 'bg-zinc-900'}`}>
                 {server.id === "fs" && <Folder className={`h-5 w-5 ${server.active ? 'text-white' : 'text-zinc-500'}`} />}
                 {server.id === "github" && <Github className={`h-5 w-5 ${server.active ? 'text-white' : 'text-zinc-500'}`} />}
                 {server.id === "db" && <Database className={`h-5 w-5 ${server.active ? 'text-white' : 'text-zinc-500'}`} />}
               </div>
               <button 
                 onClick={() => toggleServer(server.id)}
                 className={`px-3 py-1 text-[10px] font-mono rounded font-bold uppercase transition ${server.active ? 'bg-zinc-900 text-red-400 hover:bg-zinc-800' : 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-light)]'}`}
               >
                 {server.active ? "DESATIVAR" : "INICIAR MCP"}
               </button>
             </div>
             
             <h3 className={`font-bold text-sm mb-1 ${server.active ? 'text-white' : 'text-zinc-300'}`}>{server.name}</h3>
             <p className="text-xs font-sans text-zinc-500 leading-relaxed mb-4">{server.desc}</p>
             
             {server.active && (
               <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-1.5 rounded flex items-center justify-between border border-emerald-900/30">
                 <span className="flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse blur-sm"></span>
                   Socket Ativo (Stdio)
                 </span>
                 <CheckCircle className="h-3 w-3" />
               </div>
             )}
           </div>
        ))}
      </div>

    </div>
  );
}
