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

## 🚀 Instalação e Inicialização Automática

Toda a infraestrutura do JARVIS v5.0 (Instalador Nativo do Windows via Powershell, Containers Docker, Modelos do Ollama e Integrações n8n) está consolidada em um único e definitivo guia passo-a-passo.

🔗 **[CLIQUE AQUI PARA ACESSAR O TUTORIAL COMPLETO DE INSTALAÇÃO](./TUTORIAL_COMPLETO_INSTALACAO_N8N.md)**

Siga o arquivo acima e em alguns minutos você terá seu próprio ecossistema de Inteligência Artificial privado rodando nativamente no seu Windows.

---

## 🎧 Modos de Operação da IA (Widget de Voz)

O JARVIS utiliza o modelo Vosk para detecção offline imediata de palavra de ativação:

- **Modo 1 (Ativação por Voz)**: Diga **"Jarvis"** perto do microfone. O círculo da HUD pulsará em azul e começará a ouvir sua instrução.
- **Modo 2 (Teclas de Atalho)**: Pressione a tecla de atalho universal (padrão `Ctrl + Espaço`) para forçar o início de captação de voz.
- **Modo 3 (Terminal de Comando)**: Digite comandos de engenharia ou consultas tradicionais no console unificado no rodapé da página.

*Para colocar o desktop em modo silencioso e levar para a faculdade, clique em "Hibernar JARVIS" na barra do sistema — o comando de pause amortizará todos os containers, liberando instantaneamente RAM e bateria.*
