# 📚 Tutorial Absoluto: Instalação e Configuração Completa do JARVIS Core Suite v5.0 (100% Gratuito e Local)

Este guia foi criado para garantir que você provisione perfeitamente o sistema Jarvis e estruture os fluxos do **n8n** na própria máquina.
**Sim, o sistema é totalmente gratuito e soberano.** Tudo roda no seu computador: a inteligência artificial (Ollama), o banco de dados (SQLite), e as integrações, sem depender de nenhuma nuvem de terceiros. Nenhuma assinatura ou API paga é exigida.

---

## 🛠️ PARTE 1: INSTALAÇÃO E INICIALIZAÇÃO DA INTERFACE

### 1. Requisitos do Sistema
Para que tudo rode localmente e de forma fluida:
- Windows 10/11 atualizado (ou Linux/macOS).
- Cerca de 8 a 15GB livres no disco para baixar o modelo Llama 3.1.
- Node.js instalado (Versão 18+).

### 2. Configurando o Projeto
1. Extraia o ZIP deste projeto numa pasta segura (ex: `C:\jarvis-system-suite`).
2. Abra um terminal (PowerShell, CMD ou Terminal do VSCode) e navegue até a pasta do projeto.
3. Instale as bibliotecas usando: 
   `npm install`
4. Na própria interface do Sistema JARVIS, você terá uma guia **"Senhas & Tokens .ENV"**. O sistema irá auto-gerar o arquivo `.env` para você de forma segura baseada nas chaves preenchidas (GitHub e Telegram). O armazenamento se manterá exclusivamente na sua máquina e nada irá vazar.

### 3. Rodando o Motor JARVIS
No seu terminal, inicie o ambiente de produção simultâneo:
`npm run dev`

Seu terminal vai indicar que o servidor (API na porta 3000) e a interface estão online. Abra seu navegador em:
👉 **http://localhost:3000**

Com o painel aberto, acesse o menu Configurações (roda dentada) -> **"Senhas & Tokens .ENV"** e configure a sua chave local do **GitHub** (necessário caso use a função de atualizações) e a chave do seu **Telegram**.

---

## 🧠 PARTE 2: INSTALANDO O MOTOR DE IA LOCAL (OLLAMA)

O cérebro do Jarvis exige o Ollama instalado na sua máquina para ter velocidade e privacidade nativa e não depender de provedores pagos na nuvem.

1. Baixe o instalador local do Ollama em [ollama.com](https://ollama.com).
2. Prossiga com as etapas normais da instalação.
3. Abra um terminal do seu computador (Command Prompt / PowerShell) e faça o download do modelo principal de conhecimento digitando:
   `ollama run llama3.1`
   *(Pressione Enter, o download de 4.7GB vai iniciar e o modelo ficará residente no seu computador).*
4. Em seguida, instale também o extrator de memórias (utilizado pelos fluxos do N8N):
   `ollama pull nomic-embed-text`
5. Pronto! A partir de agora, as inteligências estarão respondendo localmente através do porto físico da sua máquina (localhost:11434). Operando de forma soberana e gratuita.

---

## ⚙️ PARTE 3: GUIA ABSOLUTO DOS FLUXOS NO N8N (WORKFLOWS)

Nós utilizaremos o **N8N** na máquina como "cola de integrações", gerindo conexões como o canal móvel do Telegram (opcional para falar com o sistema de longe) ou para manipulação paralela de documentos, caso use a estrutura de vetor ChromaDB. O N8N precisa ser instalado via docker (rodando na porta 5678) ou globalmente pelo terminal via `npm run n8n` / `npx n8n`. 

Se já tiver o N8N aberto (http://localhost:5678), siga os tutoriais linha a linha:

### 🧩 WORKFLOW 1: Comunicação JARVIS via Telegram (Móvel)
**Objetivo:** Permitir que você mande mensagens para o bot do Telegram quando estiver na rua cuidando das finanças, e o N8N envie essas mensagens para a Inteligência do JARVIS (Ollama Local) processar o texto, devolvendo a resposta para você. 

1. **Abra o N8N** e selecione "Add workflow".
2. **Crie o nó Gatilho (Trigger):**
   - Busque e adicione o nó **"Telegram Trigger"**.
   - Em *Credentials Name*, preencha com o **Bot Token** que gerou no @BotFather. Salve a credencial.
   - Em *Updates*, selecione "Message".
   - *Por que fizemos isso?* -> Toda mensagem ditada ou escrita no Telegram da rua ativará este fluxo instantaneamente.
3. **Crie o nó de Encaminhamento para a IA (Ollama Chat):**
   - Puxe uma linha do Telegram Trigger e adicione o nó **"Basic LLM Chain"** ou **"Ollama Chat Model"** (disponível na aba "Advanced AI" se ativada).
   - Se for o Basic LLM Chain, ele pedirá um Modelo (Model). Insira o **Ollama Chat Model**.
   - Na credencial desse Ollama, crie uma e use a rota que instalamos: `http://localhost:11434` ou `http://host.docker.internal:11434`
   - Parâmetro `Model`: Escreva exatamente `llama3.1`
   - Conecte ao nó para preencher a cadeia com o prompt. O prompt (User Message) deve ser uma expressão dinâmica referenciando a mensagem do Telegram.
   - Em *Prompt* no node digite ou selecione a expressão matemática do N8N referente ao campo de texto: `{{ $json.message.text }}`.
4. **Devolvendo a Mensagem para Você (Telegram Node):**
   - Saia do nó de Inteligência Artificial e adicione o nó de ação **"Telegram"**.
   - Credencial deve ser a mesma já gravada acima.
   - Resource: "Message", Operation: "Send Message".
   - Em *Chat ID*, puxe a expressão de ID do Trigger: `{{ $('Telegram Trigger').item.json.message.chat.id }}`
   - Em *Text*, puxe a resposta que a Inteligência (LLM) acabou de emitir (output text): `{{ $json.output }}`
5. **Salve o Workflow** (Canto superior esquerdo) e Ative a chave de produção (Canto superior direito, coloque em "Active").

### 🧩 WORKFLOW 2: Injeção de Documentos Obsidian para o ChromaDB (Memória Local)
**Objetivo:** Transformar arquivos em Markdown na sua pasta (C:\jarvis-vault) em fragmentos espaciais utilizando apenas sua placa de vídeo (nomic-embed-text) e salvando as memórias no Chroma.

1. **Crie outro Workflow:** "JARVIS Memory Sync".
2. **Nó Local File Trigger:**
   - Adicione o nó **"Local File Trigger"**.
   - *Trigger On:* Se for pasta de arquivos locais -> `File or Folder Changes` / `File Created/Updated`.
   - *Path:* Coloque o diretório exato de onde o Obsidian guarda suas notas locais. (Ex: `C:\Users\Vinicius\Documents\jarvis-vault`).
3. **Nó Read File:**
   - Adicione o arquivo referenciado na linha: Extraia informações em um nó chamado **"Read Binary File"**.
   - *Path:* `{{ $json.path }}` (Pegando dinamicamente do evento gerado).
4. **Nó Extract from File:**
   - Converta os textos binários lidos na etapa anterior passando por "Extract from File" e selecionando "Text/Markdown".
5. **A Máquina de Fatiamento (Despache de Conhecimento AI):**
   - Adicione um nó de vetor de Dados (Destino Final) indo na aba Advanced AI -> **Chroma Vector Store**.
   - *Mode:* `Insert/Update`.
   - Crie a Credencial do DB Chroma (No docker fica normalmente em `http://localhost:8000`).
   - Em *Collection Name* digite: `jarvis_vault` (tudo caixa baixa).
6. **Conectando o "Divisor" e a "Criptografia Local":**
   - O Nó Chroma Vector Store vai pedir duas "Entradas Secundárias" no topo do cartão visual dele: O Text Splitter e O Embedding.
   - Puxe um fio do Text Splitter (Document) e insira **"Recursive Character Text Splitter"**. Tamanho `chunk_size = 1000`. `Overlap = 200`. Isso previne que a IA ignore trechos cortados onde havia o contexto importante.
   - Puxe o fio do modelo de *Embedding* para acoplá-lo e selecione o **"Ollama Embeddings"**. Ele pedirá a mesma credencial local já feita (`localhost:11434`) com o Model name: `nomic-embed-text`.

### ✨ Considerações Finais
Nesta configuração 100% gratuita:
- Nenhum dado é roteado por empresas corporativas.
- Não existem taxas mensais envolvidas com LLMs ou Banco de Dados.
- Todas as solicitações ocorrem no limite das memórias isoladas do seu computador hospedeiro.

---

## 🔑 PARTE 4: GUIA DE VARIÁVEIS DE AMBIENTE E TOKENS (ONDE ENCONTRAR E COMO PREENCHER)

Para que o JARVIS se comunique fisicamente com a sua casa, seu motor local de nuvem e ferramentas fallback, você precisará preencher algumas chaves. Tudo isso é preenchido através da guia **"Senhas & Tokens .ENV"** dentro da aplicação. O sistema pegará esses valores e salvará com segurança.

### 1. `OLLAMA_HOST` (Conexão com a Inteligência Artificial Local)
**O que é:** O endereço por onde os componentes (n8n, JARVIS App, etc.) encontram o Ollama rodando no seu PC.
**Onde achar / Como preencher:**
- Como tudo está rodando na sua própria máquina (localhost), o valor padrão na maioria dos casos é:
  `http://localhost:11434`
- Caso seu Ollama esteja rodando em outro computador na rede (ex: num mini-PC dedicado), você colocará o IP dele (ex: `http://192.168.15.20:11434`). Mas se instalou na mesma máquina que usa o JARVIS, é apenas **http://localhost:11434**.

### 2. `HOME_ASSISTANT_IP` (Endereço da Automação Residencial)
**O que é:** O endereço de rede (IP) do aparelho ou servidor onde o seu Home Assistant está instalado (Raspberry Pi, máquina virtual, etc.).
**Onde achar / Como preencher:**
- Na sua rede local, descubra o IP do servidor que hospeda o Home Assistant. Você pode olhar no painel do seu Roteador ou, se acessar pelo navegador, copiar o número.
- O valor é apenas o IP comum, como por exemplo: `192.168.15.8` ou `192.168.0.101`. Não coloque "http(s)://" nem portas, apenas os números.

### 3. `HOME_ASSISTANT_TOKEN` (Chave de Acesso para a IoT)
**O que é:** A senha de "Longa Duração" (Long-Lived Access Token) que permite o JARVIS acender luzes e ler sensores sem você precisar a tela de login.
**Onde achar / Como preencher:**
1. Abra o seu **Home Assistant** no navegador.
2. Clique no seu **Perfil de Usuário** (normalmente no canto inferior esquerdo, clicando nas suas iniciais).
3. Vá até a aba **Segurança** (Security).
4. Desça a página até encontrar a seção **Tokens de Acesso de Longa Duração** (Long-Lived Access Tokens).
5. Clique em **Criar Token** (Create Token).
6. Dê o nome de "JARVIS Core" e aperte **OK**.
7. Uma caixa com uma sequência imensa de caracteres (criptográfica) vai aparecer. **Copie isso imediatamente**, pois não será mostrado novamente. Cole essa chave na caixa "HOME_ASSISTANT_TOKEN".

### 4. `GROQ_API_KEY` (Opcional - Motor Rápido para Agentes Externos)
**O que é:** Embora nosso foco seja rodar **tudo local** com Ollama, as vezes os fluxos do N8N exigem altíssima velocidade para pesquisas na web paralela. A documentação lista a "GROQ" que oferece modelos open-source (como Llama 3) super velozes via internet.
**Onde achar / Como preencher:**
1. Acesse [console.groq.com](https://console.groq.com/) a partir de seu navegador.
2. Faça login com uma conta Google simples.
3. No menu lateral, acesse **API Keys**.
4. Clique no botão de criar uma nova chave e coloque um nome (ex: "n8n_jarvis").
5. Copie a chave fornecida (normalmente começa com `gsk_...`) e cole no sistema. Essa chave pode ser deixada vazia sem problema caso você recuse dependência da nuvem até mesmo para fluxos do N8N, e opte somente por fluxos offline com Ollama.

Parabéns pela implantação primária do JARVIS!
