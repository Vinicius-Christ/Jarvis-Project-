const { app, BrowserWindow, Menu, Tray } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');

let mainWindow;
let serverProcess;
let tray = null;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    title: "JARVIS Core Suite v5.0",
    icon: path.join(__dirname, 'dist', 'favicon.ico'), // fallback a icone do build se houver
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Carrega uma tela de transição básica
  mainWindow.loadFile(path.join(__dirname, 'index.html')).catch(() => {
    // Caso não queira html estático direto, vai para o loader
  });

  // Inicializa o backend Express de alta performance (que serve os assets compilados do React no modo produção)
  serverProcess = spawn('node', ['dist/server.cjs'], {
    cwd: app.getAppPath(),
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    const logStr = data.toString();
    console.log(`[Server] ${logStr}`);
    if (logStr.includes('running on') || logStr.includes('running on http://localhost:3000')) {
      mainWindow.loadURL('http://localhost:3000');
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Erro] ${data.toString()}`);
  });

  // Tenta conectar passados alguns instantes em caso de perda de log
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000').catch(() => console.log("Aguardando inicialização do servidor..."));
  }, 3500);

  // Quando o usuário tenta fechar a janela, interceptamos para esconder na bandeja (segundo plano)
  mainWindow.on('close', function (event) {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (process.platform === 'win32') {
        mainWindow.setSkipTaskbar(true);
      }
    }
    return false;
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function createTray() {
  // Criamos uma imagem vazia ou usamos um ícone padrão do sistema para garantir inicialização sem quebra de arquivo
  // Podemos configurar um ícone padrão do Windows
  const iconPath = path.join(__dirname, 'dist', 'favicon.ico');
  
  try {
    tray = new Tray(iconPath);
  } catch (err) {
    // Cria uma bandeja genérica de texto nas plataformas suportadas se falhar o carregamento do icone .ico físico
    // No Windows, tentamos inicializar uma string genérica ou ignoramos o erro criando uma bandeja nula
    console.log("Ícone .ico não encontrado na pasta dist. Tentando bandeja simplificada.");
    // Fallback silencioso usando um arquivo temporário vazio ou usando um ícone do sistema
    tray = new Tray(path.join(__dirname, 'metadata.json')); // apenas para preencher o ponteiro de arquivo
  }

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'JARVIS Core v5.0 — Ativo', 
      enabled: false 
    },
    { type: 'separator' },
    { 
      label: 'Exibir Interface', 
      click: function () {
         if (mainWindow) {
           mainWindow.show();
           mainWindow.setSkipTaskbar(false);
         } else {
           createWindow();
         }
      } 
    },
    {
      label: 'Pausar Recursos (Docker Compose)',
      click: function () {
        console.log("[TRAY] Hibernando containers via compose...");
        exec("docker compose pause", { cwd: app.getAppPath() });
      }
    },
    {
      label: 'Retomar Recursos (Docker Compose)',
      click: function () {
        console.log("[TRAY] Despausando containers via compose...");
        exec("docker compose unpause", { cwd: app.getAppPath() });
      }
    },
    { type: 'separator' },
    { 
      label: 'Sair Completamente', 
      click: function () {
        isQuitting = true;
        if (serverProcess) {
          serverProcess.kill();
        }
        app.quit();
      } 
    }
  ]);

  tray.setToolTip('JARVIS Core - Rodando em segundo plano');
  tray.setContextMenu(contextMenu);

  // Clique simples no ícone da bandeja exibe a janela principal novamente
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    }
  });
}

app.on('ready', () => {
  createWindow();
  createTray();
});

// Em segundo plano o app continua ativo, então o comportamento default de fechar todas as janelas não mata o app
app.on('window-all-closed', function () {
  // Mantemos o app em execução na bandeja do Windows
  if (process.platform === 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  console.log("Finalizando servidor JARVIS de produção e limpando conexões...");
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
