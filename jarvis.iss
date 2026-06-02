; jarvis.iss
; Script de compilação do Inno Setup para gerar o instalador nativo do JARVIS Core Suite v5.0

[Setup]
AppId={{D8C2F2D1-331B-46C9-9A0B-4ED1A748A5C2}
AppName=JARVIS Core Suite
AppVersion=5.0
AppPublisher=Vinicius Castro
DefaultDirName={commonpf}\JARVIS Core Suite
DefaultGroupName=JARVIS Core Suite
DisableProgramGroupPage=yes
OutputDir=.
OutputBaseFilename=JarvisSetup
SetupIconFile=dist\favicon.ico
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startup"; Description: "Iniciar o JARVIS com o Windows (Em segundo plano)"; GroupDescription: "Configurações Globais:"

[Files]
; Copia o binário unificado do servidor compilado em CJS/EXE para a pasta de arquivos de programas
Source: "dist\server.cjs"; DestDir: "{app}"; Flags: ignoreversion
; Copia a build do Frontend React compilada
Source: "dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs
; Copia os arquivos de banco de dados locais e configurações
Source: "data\*"; DestDir: "{userappdata}\JARVIS Core\data"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "docker-compose.yml"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\JARVIS Core Suite"; Filename: "{app}\server.cjs"; IconFilename: "{app}\dist\favicon.ico"
Name: "{commondesktop}\JARVIS Core Suite"; Filename: "{app}\server.cjs"; IconFilename: "{app}\dist\favicon.ico"; Tasks: desktopicon

[Registry]
; Registra o JARVIS para iniciar silenciosamente em segundo plano junto com o Windows se a Task estiver marcada
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "JARVISCore"; ValueData: """{app}\server.cjs"" --background"; Flags: uninsdeletevalue; Tasks: startup

[Run]
; Inicializa a pilha de serviços Docker compose locais ao finalizar a instalação física
Filename: "powershell.exe"; Parameters: "-Command ""Set-Location '{app}'; docker compose up -d"""; Flags: runhidden
; Executa o backend invisivelmente
Filename: "{app}\server.cjs"; Description: "{cm:LaunchProgram,JARVIS Core Suite}"; Flags: shellexec runascurrentuser postinstall nowait
