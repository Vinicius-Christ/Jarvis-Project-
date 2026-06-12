import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /{activeTab === "settings" && \([\s\S]*?{settingsTab === "packager" && <PackagerModule \/>}/;

const newSettings = `{activeTab === "settings" && (
              <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden border border-zinc-800 rounded-xl bg-black/20 animate-fade-in relative z-10 shadow-2xl">
                {/* Left Sidebar for Tabs */}
                <div className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950/50 flex flex-col overflow-y-auto custom-scrollbar">
                  
                  {/* Category: SISTEMA */}
                  <div className="p-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-zinc-800 bg-black/40">
                    Sistema
                  </div>
                  <div className="flex flex-col p-2 gap-1 font-mono text-xs">
                    <button
                      onClick={() => setSettingsTab("general")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "general"
                          ? "bg-[var(--brand-glow)] text-[var(--brand-light)] font-bold shadow-[0_0_10px_var(--brand-glow-strong)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      ⚙️ Configurações & IoT
                    </button>
                    <button
                      onClick={() => setSettingsTab("appearance")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "appearance"
                          ? "bg-[var(--brand-glow)] text-[var(--brand-light)] font-bold shadow-[0_0_10px_var(--brand-glow-strong)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      🎨 Aparência
                    </button>
                    <button
                      onClick={() => setSettingsTab("updates")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap relative \${
                        settingsTab === "updates"
                          ? "bg-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      🔄 Atualizações
                      {updateState?.status === "available" && (
                        <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                    </button>
                    <button
                      onClick={() => setSettingsTab("tokens")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "tokens"
                          ? "bg-amber-500/20 text-amber-400 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-amber-500/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      🔐 Senhas & Tokens
                    </button>
                  </div>

                  {/* Category: WORKSPACE & IA */}
                  <div className="p-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-t border-zinc-800 mt-2 bg-black/40">
                    Workspace & IA
                  </div>
                  <div className="flex flex-col p-2 gap-1 font-mono text-xs">
                    <button
                      onClick={() => setSettingsTab("chromadb")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "chromadb"
                          ? "bg-cyan-500/20 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      🧠 Memória ChromaDB
                    </button>
                    <button
                      onClick={() => setSettingsTab("obsidian")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "obsidian"
                          ? "bg-[var(--brand-glow)] text-[var(--brand-light)] font-bold shadow-[0_0_10px_var(--brand-glow-strong)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      📝 Obsidian Vault
                    </button>
                    <button
                      onClick={() => setSettingsTab("mcp")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "mcp"
                          ? "bg-[var(--brand-glow)] text-[var(--brand-light)] font-bold shadow-[0_0_10px_var(--brand-glow-strong)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      🔌 Integração MCP
                    </button>
                    <button
                      onClick={() => setSettingsTab("cudautil")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "cudautil"
                          ? "bg-indigo-500/20 text-indigo-400 font-bold shadow-[0_0_10px_rgba(99,102,241,0.2)] border border-indigo-500/30"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      📊 Telemetria CUDA
                    </button>
                  </div>

                  {/* Category: MANUTENÇÃO */}
                  <div className="p-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-t border-zinc-800 mt-2 bg-black/40">
                    Manutenção
                  </div>
                  <div className="flex flex-col p-2 gap-1 font-mono text-xs">
                    <button
                      onClick={() => setSettingsTab("installer")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "installer"
                          ? "bg-[var(--brand-glow)] text-[var(--brand-light)] font-bold shadow-[0_0_10px_var(--brand-glow-strong)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      📦 Core Engine & Logs
                    </button>
                    <button
                      onClick={() => setSettingsTab("packager")}
                      className={\`px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer whitespace-nowrap \${
                        settingsTab === "packager"
                          ? "bg-[var(--brand-glow)] text-[var(--brand-light)] font-bold shadow-[0_0_10px_var(--brand-glow-strong)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                      }\`}
                    >
                      📦 Gerar Instalador
                    </button>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-black/[0.15] custom-scrollbar">
                {settingsTab === "packager" && <PackagerModule />}`;

content = content.replace(regex, newSettings);

// Add closing tags
// Find the exact tokens manager
const tokensStr = '{settingsTab === "tokens" && <TokensManager />}';
const closeDivs = `\n                </div>\n              </div>`;
content = content.replace(
  tokensStr,
  tokensStr + closeDivs
);

// We need to carefully remove the original closing tags that belonged to the `space-y-6 flex flex-col h-full overflow-hidden`
// It looked like:
/*
                {settingsTab === "tokens" && <TokensManager />}
              </div>
            )}
*/
// The above `closeDivs` will make it:
/*
                {settingsTab === "tokens" && <TokensManager />}
                </div>
              </div>
              </div>
            )}
*/
// Wait, the regexEnd replace isn't quite robust. Let me fix the app.tsx block manually or with a precise replace.

let index = content.indexOf(tokensStr);
if (index !== -1) {
    // find the next closing </div> for the settings tab content.
    // wait, we replaced `<div className="space-y-6 flex flex-col h-full overflow-hidden">`
    // with `<div className="flex..."> ... <div className="flex-1">`
    // So there is one extra `<div>` opened now!
    // We added the </div> </div> right after TokensManager, which is correct (one closes right content, one closes main flex).
    // Let's verify original structure:
    // {activeTab === "settings" && (
    //   <div className="space-y-6 flex flex-col h-full overflow-hidden">
    //     <div className="flex gap-2 ..."> ... </div>
    //     {settingsTab === "packager" ... }
    //     ...
    //     {settingsTab === "tokens" ... }
    //   </div>
    // )}
    //
    // New:
    // {activeTab === "settings" && (
    //   <div className="flex h-[calc[...]">
    //     <div className="w-56 ..."> ... </div>
    //     <div className="flex-1 ...">
    //     {settingsTab === "packager" ... }
    //     ...
    //     {settingsTab === "tokens" ... }
    //     </div>
    //   </div>
    // )}
    // Yes! That's exactly mapping 1 to 1 perfectly.
    // I will replace `tokensStr` with `tokensStr + "\n                </div>"` instead! Because the outer `</div>` is already there.
}

content = content.replace(
  tokensStr,
  tokensStr + "\n                </div>"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Settings Layout Rewritten");
