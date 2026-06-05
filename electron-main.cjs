const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
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

  // Inicializa o backend Express requerendo diretamente no processo main
  try {
    process.env.NODE_ENV = 'production';
    require(path.join(__dirname, 'dist', 'server.cjs'));
    console.log("[Server] EXPRESS SERVER INICIADO INTERNAMENTE");
    
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000').catch(() => {});
    }, 1500);
  } catch (err) {
    console.error("[Server Erro Interno]", err);
  }

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

function getTrayIcon() {
  const icoPath = path.join(__dirname, 'dist', 'favicon.ico');
  const pngPath = path.join(__dirname, 'assets', 'icon.png');
  
  if (fs.existsSync(icoPath)) {
    try {
      return nativeImage.createFromPath(icoPath);
    } catch (err) {
      console.warn("Falha ao criar nativeImage a partir de dist/favicon.ico:", err);
    }
  }
  
  if (fs.existsSync(pngPath)) {
    try {
      return nativeImage.createFromPath(pngPath);
    } catch (err) {
      console.warn("Falha ao criar nativeImage a partir de assets/icon.png:", err);
    }
  }
  
  // Último fallback robusto usando um ícone minimalista em base64
  return nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
}

function createTray() {
  try {
    const icon = getTrayIcon();
    tray = new Tray(icon);
  } catch (err) {
    console.log("Falha ao criar Tray com imagens em cache. Tentando bandeja em modo vazio seguro.", err);
    try {
      tray = new Tray(nativeImage.createEmpty());
    } catch (fallbackErr) {
      console.error("Erro absoluto ao inicializar o Tray do Electron:", fallbackErr);
      return;
    }
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
        exec("docker compose pause", { cwd: app.getAppPath(), shell: true }, (err, stdout, stderr) => {
          if (err) console.error("[Docker Pause Erro]", err);
        });
      }
    },
    {
      label: 'Retomar Recursos (Docker Compose)',
      click: function () {
        console.log("[TRAY] Despausando containers via compose...");
        exec("docker compose unpause", { cwd: app.getAppPath(), shell: true }, (err, stdout, stderr) => {
          if (err) console.error("[Docker Unpause Erro]", err);
        });
      }
    },
    { type: 'separator' },
    { 
      label: 'Sair Completamente', 
      click: function () {
        isQuitting = true;
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
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
