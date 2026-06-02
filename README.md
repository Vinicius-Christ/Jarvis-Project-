# JARVIS Core Suite v5.0 — Sistema de Assistente Pessoal Local-First e Privado

Este repositório contém o código-fonte, a documentação e os scripts de deploy do **JARVIS** (Just A Rather Very Intelligent System). O ecossistema é projetado sob a filosofia *Local-First* (comunicação direta e irrestrita em rede local), trazendo privacidade absoluta (zero APIs terceirizadas na versão de produção), custo recorrente zero e performance de alto nível acelerada por **NVIDIA CUDA**.

O software atua como a interface central do usuário (app de desktop) onde se manipula a IA local, além de funcionar como o **Instalador e Configurador Automatizado** de todo o ecossistema e ferramentas satélites necessárias.

---

## 🛠️ Detalhes de Implementação Técnica

O JARVIS é focado em processar todas as regras em hardware de VRAM dedicada (idealmente com uma placa RTX 4070 Ti de 12GB ou superior).

### 🦾 Arquitetura Modular

1. **Camada de IA Local (Ollama)**
   - Roda o modelo de NLP **Llama 3.1 (8B)** quantizado em 4-bit GGUF, ocupando apenas ~4.7GB de VRAM.
   - Utiliza outro modelo ultraleve (**nomic-embed-text**) para converter textos em vetores matemáticos para a pesquisa semântica local.
   - O Ollama roda nativamente no sistema operacional Windows do desktop para acessar os drivers de aceleração CUDA sem o gargalo de virtualização do WSL2.

2. **Ingestão Inteligente de Conhecimento (RAG)**
   - Utiliza **ChromaDB** rodando em container Docker como banco de dados vetorial.
   - Toda vez que o usuário arrasta documentos (extratos bancários em PDF, agendas, notas de estudos), scripts em Python no n8n quebram o arquivo em pedaços (*chunks*), transformam em vetores usando o nomic-embed e gravam no ChromaDB.

3. **Base de Memória Mutável (Obsidian Vault)**
   - Toda a memória de longo prazo do JARVIS é guardada em arquivos Markdown legíveis em formato texto normal em uma pasta `C:\jarvis-vault`.
   - Você pode ler diretamente, modificar o que o assistente aprendeu ou auditar preferências. O n8n escuta alterações na pasta física em tempo real para sincronizar o cérebro vetorial.

4. **Automação Residencial e PC Principal**
   - Conectado à API local do **Home Assistant** via Zigbee/Matter para ligar e orquestrar cenários ("Modo Cinema", "Modo Trabalho").
   - O app do PC Principal escuta payloads via WebSocket e dispara automações locais como simular cliques (Python pyautogui) e rodar scripts de carregamento de workspaces no PowerShell.

---

## 🚀 Como Usar o Instalador Automatizado

O app fornece um fluxo de provisionamento automatizado de 1 clique, integrando ferramentas através do gerenciador de pacotes nativo do Windows (winget) e WSL2.

### Passo 1: Preparação do Arquivo `.env`
Renomeie o `.env.example` da raiz para `.env` e preencha as portas locais e credenciais do bot do Telegram:
```env
GEMINI_API_KEY="seu_token_opcional"
APP_URL="a_url_da_estacao"
```

### Passo 2: Execução do Script PowerShell
Abra o **Windows PowerShell** no seu computador principal ou desktop servidor como **Administrador** e execute o script local:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\AutoInstaller.ps1
```

O instalador irá:
1. Habilitar o WSL2 e VirtualMachinePlatform se não estiverem ativos.
2. Instalar silenciosamente o **Docker Desktop**, o **Obsidian** e o **Ollama**.
3. Baixar os modelos `llama3.1` e `nomic-embed-text` preparando caches CUDA.
4. Estruturar o Obsidian Vault com as pastas de perfil, controle financeiro e logs.

### Passo 3: Provisionar os Containers Docker
Após a instalação terminar e você reiniciar a máquina para carregar o Docker, entre no diretório e suba a stack:

```bash
docker compose up -d
```

Este comando provisiona:
- **ChromaDB** (Buscador vetorial na porta 8000)
- **n8n** (Orquestrador de workflows na porta 5678)
- **Home Assistant** (Hub IoT local)
- **PostgreSQL** (Banco relacional para finanças/compromissos na porta 5432)
- **Redis** (Monitor de filas de inputs de voz)

---

## 🎧 Modos de Operação da IA (Widget de Voz)

O JARVIS utiliza o modelo Vosk para detecção offline imediata de palavra de ativação:

- **Modo 1 (Ativação por Voz)**: Diga **"Jarvis"** perto do microfone. O círculo da HUD pulsará em azul e começará a ouvir sua instrução.
- **Modo 2 (Teclas de Atalho)**: Pressione a tecla de atalho universal (padrão `Ctrl + Espaço`) para forçar o início de captação de voz.
- **Modo 3 (Terminal de Comando)**: Digite comandos de engenharia ou consultas tradicionais no console unificado no rodapé da página.

*Para colocar o desktop em modo silencioso e levar para a faculdade, clique em "Hibernar JARVIS" na barra do sistema — o comando de pause amortizará todos os containers, liberando instantaneamente RAM e bateria.*
