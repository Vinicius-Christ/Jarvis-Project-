import React, { useState } from 'react';
import { Download, TerminalSquare, Package, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PackagerModule() {
  const [buildState, setBuildState] = useState<'idle' | 'building' | 'done'>('idle');
  const [appName, setAppName] = useState('JARVIS-HUD');
  const [version, setVersion] = useState('1.0.0');
  const [enableTray, setEnableTray] = useState(true);

  const innoScript = `; Script Inno Setup Gerado Automaticamente para JARVIS
[Setup]
AppName=${appName}
AppVersion=${version}
AppPublisher=Vinicius Systems
AppPublisherURL=http://localhost:3000
DefaultDirName={pf}\\${appName}
DefaultGroupName=${appName}
OutputDir=.\\build
OutputBaseFilename=${appName.replace(/\s+/g, '')}Setup_v${version}
SetupIconFile=.\\assets\\icon.ico
Compression=lzma
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Requer os binários de release do Electron na pasta dist
Source: ".\\dist\\win-unpacked\\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\\${appName}"; Filename: "{app}\\${appName}.exe"
Name: "{commondesktop}\\${appName}"; Filename: "{app}\\${appName}.exe"; Tasks: desktopicon

${enableTray ? `[Registry]
; Configura inicialização junto com o Windows para rodar em segundo plano na bandeja (opcional)
Root: HKCU; Subkey: "Software\\Microsoft\\Windows\\CurrentVersion\\Run"; ValueType: string; ValueName: "${appName}"; ValueData: "{app}\\${appName}.exe --hidden"; Flags: uninsdeletevalue
` : ''}
[Run]
Filename: "{app}\\${appName}.exe"; Description: "{cm:LaunchProgram,${appName}}"; Flags: nowait postinstall skipifsilent
`;

  const handleBuild = () => {
    setBuildState('building');
    setTimeout(() => {
      setBuildState('done');
    }, 2000);
  };

  const downloadScript = () => {
    const element = document.createElement("a");
    const file = new Blob([innoScript], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "jarvis_installer.iss";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="bg-zinc-950/50 border border-zinc-850 p-6 rounded-2xl relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 border-b border-zinc-850 pb-4">
        <Package className="text-emerald-400 w-6 h-6" />
        <div>
          <h2 className="text-lg font-bold text-[var(--brand-light)] font-mono tracking-wide">ELECTRON DEPLOY & INNO SETUP</h2>
          <p className="text-[11px] text-zinc-400 font-sans">Gere scripts nativos do Windows para empacotar e distribuir o HUD offline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Setup config */}
        <div className="space-y-4 relative z-10 w-full">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1 block">Nome do App</label>
            <input 
              type="text" 
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-[var(--brand-light)] font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1 block">Versão de Release</label>
            <input 
              type="text" 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-[var(--brand-light)] font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-3 pb-1 border-b border-zinc-850">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={enableTray}
                onChange={(e) => setEnableTray(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20"
              />
              <div>
                <span className="text-xs font-bold text-zinc-300 block uppercase tracking-wide group-hover:text-emerald-400 transition-colors">Modo Oculto & System Tray (Bandeja)</span>
                <span className="text-[10px] text-zinc-500 font-mono">Ao fechar, minimiza para a barra de tarefas e roda em 2º plano no Windows.</span>
              </div>
            </label>
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wide">Passo a Passo de Build</h3>
            <ul className="text-xs text-zinc-400 space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                <span>Compile a interface React (Vite): <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">npm run build</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>Gere os binários via Electron Builder: <code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">npx electron-builder --win --dir</code></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                <span>Compile este script \`.iss\` com InnoSetup Compiler.</span>
              </li>
            </ul>
          </div>
          
          <div className="pt-2 flex gap-3">
            <button 
              onClick={handleBuild}
              className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {buildState === 'idle' ? 'Validar Build' : buildState === 'building' ? 'Analisando...' : 'Validado ✓'}
            </button>
            <button 
              onClick={downloadScript}
              className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar .ISS Script
            </button>
          </div>
        </div>

        {/* Right Side: Script preview */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl flex flex-col relative z-10 w-full">
          <div className="bg-zinc-900 rounded-t-xl px-4 py-2 border-b border-zinc-850 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <TerminalSquare className="w-4 h-4 text-emerald-500" />
               <span className="text-xs font-mono font-bold text-zinc-400">jarvis_installer.iss</span>
             </div>
             <div className="flex gap-1.5">
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
             </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed text-zinc-300 bg-zinc-950 shrink-0 h-64 md:h-auto">
             <pre className="whitespace-pre-wrap">{innoScript}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
