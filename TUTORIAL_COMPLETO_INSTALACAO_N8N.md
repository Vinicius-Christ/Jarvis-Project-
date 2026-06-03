# 📚 Tutorial Extremo e Detalhado: Instalação e Configuração Completa do JARVIS Core Suite v5.0

Este guia foi criado para garantir que qualquer usuário, mesmo que não seja um desenvolvedor sênior de infraestrutura, consiga provisionar perfeitamente o sistema Jarvis e estruturar os fluxos do **n8n** na própria máquina, habilitando a "consciência física" do assistente sem depender de nuvem paga.

---

## PARTE 1: PREPARANDO E INSTALANDO O ECOSSISTEMA JARVIS

### 1. Requisitos do Sistema
Para que tudo rode localmente de forma fluida, assumimos que sua máquina possui:
- Windows 10/11 atualizado.
- O Virtualization Technology (VT-x / AMD-V) habilitado na BIOS.
- Cerca de 20GB livres no disco (para as Imagens do Docker e Modelos do Ollama).
- Placa de Vídeo Dedicada (NVIDIA com no mínimo 6 a 8GB de VRAM, ou mais).

### 2. Exportando e Preparando o Software
1. Vá até o menu do AI Studio / Editor que você está usando e clique para exportar este projeto (via ZIP). 
2. Extraia a pasta \`jarvis-system-suite\` em algum local de fácil acesso, como \`C:\Projetos\jarvis\` ou \`Documentos\jarvis\`.
3. Abra a pasta, localize o arquivo chamado \`.env.example\` e copie/renomeie-o para apenas \`.env\`. Adicione ali as credencias (caso precise).

### 3. Rodando o Script de Auto-Instalação Local
O software possui um script `AutoInstaller.ps1` já pré-configurado que fará quase todo o trabalho pesado.

1. Pressione a tecla Windows e digite **PowerShell**.
2. Clique com o botão direito sobre o PowerShell e selecione **"Executar como Administrador"**.
3. No terminal negro, navegue até a pasta do arquivo extraído. Se ele estiver em `C:\Projetos\jarvis`, digite:
   \`cd C:\Projetos\jarvis\`
4. Permita a execução de scripts temporariamente digitando:
   \`Set-ExecutionPolicy Bypass -Scope Process -Force\`
5. Em seguida execute o instalador:
   \`.\\AutoInstaller.ps1\`

*O script irá (1) Ativar o WSL2, (2) Baixar e instalar o Docker Desktop de forma automática caso não exista, (3) Instalar o Ollama para rodar modelos locais, (4) Iniciar o download do Llama 3.1 e nomic-embed-text (Isso pode demorar dependendo da internet).*

> **⚠️ Atenção:** Se foi a primeira vez instalando o WSL2, seu Windows pedirá para reiniciar. Reinicie ele. Ao voltar, abra o aplicativo **Docker Desktop** no menu iniciar para garantir que o mecanismo Docker comece a rodar e mostre o ícone de baleia verdinho na bandeja perto do relógio.

### 4. Iniciando as Ferramentas Satélites (Docker Compose)
1. Com o **Docker Desktop** já aberto e girando tranquilamente ao fundo, abra o Terminal na pasta do seu projeto.
2. Digite: \`docker compose up -d\`
3. Isso vai baixar o **n8n**, o **ChromaDB**, o **PostgreSQL** e o **Redis**. 
4. Aguarde e o sistema estará provisionado. 

### 5. Executando ou Instalando o App (Desktop App)
Como transformamos esse projeto em um software de produção Full-Stack, você tem algumas opções, sendo uma delas gerar um instalador para a sua máquina.

**Opção A: Gerar Instalação Definitiva (.exe Windows)**
Para não depender mais do terminal ou \`npm start\` e ter o atalho de inicialização no desktop/barra de tarefas:
1. Pelo terminal (Node.js) instale todas as dependências: \`npm install\`
2. Compile e rode o construtor do Electron: \`npm run dist\`
3. No final, uma pasta chamada \`release\` será criada no projeto. Dentro dela, haverá um instalador **JARVIS Suite Setup.exe**.
4. Instale e abra como qualquer software comum! (Ele sempre iniciará e rodará silenciosamente no *System Tray* perto do relógio).

**Opção B: Rodar a Versão Standalone Nativa**
Se prefere não instalar, mas ligar o motor final sem a janela nativa.
1. \`npm install\`
2. \`npm run build\`
3. \`npm run start\`
4. Acesse pelo navegador \`http://localhost:3000\`.

**Opção C: Rodar em Modo de Desenvolvimento (Caso queira fazer alterações no código)**
1. \`npm install\`
2. \`npm run dev\`
(Em seguida abra \`http://localhost:3000\` no seu navegador).

---

## PARTE 2: CRIANDO OS FLUXOS COMPATÍVEIS NO N8N

Para que a "Busca Semântica Local" e o armazenamento em Longo Prazo do JARVIS funcione (para ele "lembrar" dos seus objetivos ou de arquivos PDF que jogue nele), usaremos a conexão do Obsidian (pasta física no seu PC) com o banco Vetorial ChromaDB através do n8n.

### 1. Acessando o n8n
1. No seu navegador acesse \`http://localhost:5678\`.
2. Como será o primeiro acesso, o n8n vai pedir que você crie um login e senha administrador (pode ser o que achar melhor, ex: admin/admin).
3. Após logar, você verá o painel de criação de **Workflows** em branco.

### 2. Configurando o Fluxo de "Memória Persistente" (Sync Obsidian -> ChromaDB)
Esse fluxo serve para que toda vez que um documento entrar na pasta C:\jarvis-vault, o modelo de IA seja capacitado de absorver ele imediatamente.

1. Clique em **"Add workflow"** (Adicionar fluxo de trabalho).
2. De um nome legal como **"JARVIS Memory Ingestion"**.

**Passo A: Gatilho (Trigger) de Pasta Local**
- Clique em *Add first step*.
- Procure pelo nó chamado **"Local File Trigger"**.
- Em tipo de evento, escolha **"File Created"** e **"File Updated"**.
- No caminho do diretório (Watch Directory Pãth), coloque o mapeamento da sua pasta: \`C:\jarvis-vault\`. (Lembre-se que o AutoInstaller cria esse container, se você estiver rodando em dockers via WSL mapeados, veja em bind volumes localizados ou indique a pasta relativa mapeada em settings). 

**Passo B: Extraindo o Texto do Arquivo**
- Arraste uma linha desse Trigger pressionando o ícone \`+\`
- Adicione o nó **"Read Binary File"** (Ou **Read File** nativo).
- Especifique a entrada para a mesma propriedade do nó passado \`{{ $json.path }}\`.
- Em seguida adicione um nó **"Extract from File"** selecionando formato texto bruto/markdown.

**Passo C: Divisão de Texto**
- Adicione agora o nó da guia Advanced AI: **"Character Text Splitter"** ou "Text Splitter".
- Tamanho do Chunk: **1000**
- Overlap (sobreposição): **200**
- (Isto evita que o cérebro engasgue com livros grandes).

**Passo D: Geração dos Vetores Math (Embeddings)**
- No nó do Text Splitter, a sua saída não vai direto! Você precisará adicionar um Nó de "Vector Store" na frente.
- Busque o nó de dados Chroma: **"Chroma Vector Store"** e adicione.
- No Chroma Node, escolha **"Insert/Update"**.
- Ele vai pedir as credenciais. Clique em **"Create New Credentials"**.
- Em URL digite a comunicação interna do docker: \`http://chromadb:8000\` ou \`http://host.docker.internal:8000\`. Teste e salve.
- Em nome da coleção (Collection Name), crie ou digite **"jarvis_memory"**.
- Ele vai precisar de um *Embedding Model*. Clique na entrada correspondente.
- Escolha **Ollama Embeddings**.
- Para as credenciais do Ollama crie uma nova e coloque: \`http://host.docker.internal:11434\`.
- O nome do modelo será: \`nomic-embed-text\`.

3. **Salve e Ative o Fluxo (Interruptor no canto superior direito do n8n para "Active").**

A partir de agora, qualquer anotação na pasta jarvis-vault (em formatação Markdown) será esquartejada, transformada em sinais neurais por sua placa de vídeo pelo Ollama e depositada no armazenamento persistente vetorial do ChromaDB local, permitindo que a aplicação react React leia estes clusters chamando nossa porta já existente de busca vetorial!

### 3. Configurando Fluxo Opcional de Gatilho de Automação de Casa (Home Assistant)
1. Criar novo Workflow no n8n.
2. Adicione nó Trigger chamado **"Webhook"**. Tipo GET, endereço de produção: \`/jarvis-iot-toggle\`.
3. Adicione o nó **Home Assistant**. (Ele vai pedir credenciais, gere um Long-Lived Token lá no servidor local do Home Assistant se quiser integrá-lo futuramente).
4. Mande este nó disparar uma luz ou toggle basedo no input recebido do seu software JARVIS que está apontando para o n8n no backend.

---

## 🚀 Validando Todo o Percurso
Se tudo subiu corretamente, faça este teste:

1. Acesse o **Projeto React do JARVIS** que rodamos \`npm run dev\` na sua máquina.
2. As luzes de diagnóstico do canto superior direito devem estar **Verdes** para Database Postgres e VRAM/Docker.
3. Crie um arquivo chamado \`perfil_teste.md\` na pasta física do vault (\`C:\jarvis-vault\`) e escreva "Gosto de tomar suco de limão". 
4. O **n8n** vai ver a criação, ativar a conversão no **Ollama embeddings** e salvar no **ChromaDB**.
5. Em sua interface JARVIS, quando perguntar "Que suco eu gosto de tomar?", o backend local irá caçar nas lembranças semânticas através do chroma o mais próximo do seu texto de pesquisa e injetará como contexto para a placa de vídeo.

> Esse ecossistema foi pensado para operar por conta própria, sendo soberano localmente e imune a apagões de rede mundial!
