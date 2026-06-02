# AutoInstaller.ps1
# Script de Instalação e Configuração Automatizada do Ecossistema JARVIS v5.0
# Execute este arquivo no Windows Terminal do Desktop Ryzen 7 / PC de Jogos como ADMINISTRADOR

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "          JARVIS AUTOMATED INSTALLER & CONFIGURATION     " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Este script irá instalar Docker, Ollama, Obsidian e configurar toda a base do seu JARVIS no Windows."

# 1. Verificar privilégios de Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "AVISO: Por favor, execute este script como ADMINISTRADOR no Windows Terminal ou PowerShell."
    Exit
}

# 2. Ativar Recursos do Windows para WSL2 e Máquina Virtual
Write-Host "[1/5] Ativando Recursos Opcionais do Windows (WSL2)..." -ForegroundColor Yellow
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# 3. Instalar softwares usando o Windows Package Manager (winget)
Write-Host "[2/5] Baixando e Instalando Docker, Ollama e Obsidian..." -ForegroundColor Yellow

# Instalar Docker Desktop
Write-Host "Instalando Docker Desktop..." -ForegroundColor Cyan
winget install Docker.DockerDesktop --silent --accept-package-agreements --accept-source-agreements

# Instalar Obsidian
Write-Host "Instalando Obsidian..." -ForegroundColor Cyan
winget install Obsidian.Obsidian --silent --accept-package-agreements

# Instalar Ollama
Write-Host "Instalando Ollama..." -ForegroundColor Cyan
winget install Ollama.Ollama --silent --accept-package-agreements

# 4. Criar estrutura do Obsidian Vault
Write-Host "[3/5] Estruturando Obsidian Vault em C:\\jarvis-vault..." -ForegroundColor Yellow
$vaultPath = "C:\\jarvis-vault"
$dirs = @("perfil", "agenda", "financas", "casa", "conversas", "aprendizados", "arquivos-indexados", "rotinas-pc")

if (-not (Test-Path $vaultPath)) {
    New-Item -ItemType Directory -Force -Path $vaultPath | Out-Null
}

foreach ($dir in $dirs) {
    $subPath = Join-Path $vaultPath $dir
    if (-not (Test-Path $subPath)) {
        New-Item -ItemType Directory -Force -Path $subPath | Out-Null
        Write-Host "Criada pasta: C:\\jarvis-vault\\$dir" -ForegroundColor Gray
    }
}

# Criar arquivo de Perfil do Usuário padrão com dados estruturados
$profileContent = @"
# Perfil do Usuário - Vinícius

Nome: Vinícius
Tom preferido: Respeitoso, inteligente, refinado, estilo Mordomo / JARVIS
Horário produtivo principal: 19:00 - 23:00
Foco atual: Automação residencial de luzes e ar condicionado, e controle financeiro pessoal.
Modelos: Llama 3.1 (8B) quantizado em 4-bit para comandos gerais, Phi-3 Mini para português avançado.
Hardware: Máquina Server (RTX 4070 Ti 12GB VRAM para processar CUDA offline).
"@
Set-Content -Path "C:\\jarvis-vault\\perfil\\usuario.md" -Value $profileContent

# Criar notas financeiras iniciais para o RAG ler
$financasContent = @"
# Controle Financeiro Pessoal — Metas de Economia

- Renda Mensal Estipulada: R$ 5.000,00
- Meta de Reserva Mensal: R$ 1.500,00 (30% da renda)

## Limites de Alerta por Categoria
- Alimentação (iFood, Supermercados): R$ 800,00
- Lazer: R$ 400,00
- Saúde: R$ 350,00
- Educação: R$ 300,00
- Transporte: R$ 300,00
"@
Set-Content -Path "C:\\jarvis-vault\\financas\\metas.md" -Value $financasContent

# Criar notas de automação de PC iniciais
$rotinasContent = @"
# Rotinas de Automação do PC Principal (Cliente Electron)

- **Iniciar Trabalho**: VS Code + Chrome (3 abas de documentação) + Slack
- **Ambiente de Estudos**: Notion + Chrome (Playlist Lo-Fi Beats no Spotify) + PDF Reader carregado
- **Modo Jogos**: Steam Launcher + Discord Client + MSI Afterburner ventiladores ativos
"@
Set-Content -Path "C:\\jarvis-vault\\rotinas-pc\\estudos.md" -Value $rotinasContent

# Criar notas da casa inteligente (Home Assistant)
$casaContent = @"
# Equipamentos e Dispositivos da Casa

- Lâmpada da Escrivaninha (Fita LED Zigbee)
- TV da Sala (Chromecast Smart TV)
- Ar-Condicionado (Split Wi-Fi de 12000 BTUs)
- Robô Aspirador (Smart Vacuum operando na base)
"@
Set-Content -Path "C:\\jarvis-vault\\casa\\dispositivos.md" -Value $casaContent

# 5. Baixar modelos locais no Ollama
Write-Host "[4/5] Inicializando serviço do Ollama e baixando modelos locais na placa RTX 4070 Ti..." -ForegroundColor Yellow
Start-Process -FilePath "ollama" -ArgumentList "serve" -NoNewWindow -PassThru
Start-Sleep -Seconds 5

Write-Host "Baixando modelo principal Llama 3.1 (8B) Q4..." -ForegroundColor Cyan
ollama pull llama3.1

Write-Host "Baixando modelo de Embeddings para RAG (nomic-embed-text)..." -ForegroundColor Cyan
ollama pull nomic-embed-text

Write-Host "[5/5] Docker-compose e Obsidian prontos!" -ForegroundColor Green
Write-Host "Sistemas prontos! Crie o arquivo docker-compose.yml e execute 'docker compose up -d' na pasta do seu projeto para ligar o n8n, ChromaDB e PostgreSQL." -ForegroundColor Green
Write-Host "Instalação concluída com sucesso! Favor reiniciar a máquina para carregar o Docker WSL2." -ForegroundColor Green
Read-Host -Prompt "Pressione Enter para sair..."
