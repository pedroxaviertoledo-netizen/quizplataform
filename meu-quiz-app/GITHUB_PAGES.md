# Publicar no GitHub Pages

## O que será publicado

O workflow publica automaticamente a pasta `frontend/`, que contém a interface do Quiz Platform.

## Como ativar

1. Crie um repositório no GitHub e envie este projeto para a branch `main`.
2. Abra `Settings > Pages` no repositório.
3. Em `Build and deployment`, selecione `GitHub Actions`.
4. Aguarde o workflow `Publicar interface no GitHub Pages` terminar.
5. O endereço será exibido na página da Action e em `Settings > Pages`.

## Limitação importante

O GitHub Pages hospeda apenas arquivos estáticos. O backend Node.js, o login, a criação de quizzes e o Socket.io não rodam no Pages.

Para usar essas funções publicamente, o backend precisa ser executado em um servidor Node.js. Para uso local, o projeto agora salva tudo em `backend/.data/local-db.json` e não depende de MongoDB.

Também será necessário trocar a conexão Socket.io para a URL pública do backend nas páginas que utilizarem partidas em tempo real.

## Backend online continuamente

O arquivo `render.yaml` é opcional para publicação externa. No uso local, mantenha um terminal aberto na pasta do projeto e execute:

```powershell
npm start
```

Para iniciar com reinício automático se o backend parar, use:

```powershell
npm run start:auto
```

Ou abra o arquivo `iniciar-site.bat`. O monitor verifica a porta `3000`, evita duplicar o servidor e reinicia o backend automaticamente se ele encerrar.

O backend local ficará em `http://localhost:3000` e os dados ficarão em `backend/.data/local-db.json`.

Para publicar externamente, o arquivo `render.yaml` contém uma configuração de Render, mas isso não é necessário para executar o site localmente:

1. Crie um banco MongoDB hospedado, por exemplo no MongoDB Atlas.
2. No Render, crie um novo Blueprint apontando para o repositório.
3. Informe `MONGO_URI` nas variáveis secretas do serviço.
4. O `JWT_SECRET` será gerado automaticamente pela configuração.
5. Após o deploy, copie a URL pública do backend.
6. Em `frontend/js/api.js`, substitua `http://localhost:3000/api` pela URL pública seguida de `/api`.

Depois disso, o Render manterá o processo Node.js online e fará novo deploy a cada atualização enviada ao repositório.

## Publicar usando Railway

Este projeto também possui `railway.json` configurado para o Railway.

1. Envie o projeto para um repositório GitHub.
2. No Railway, escolha `New Project` e depois `Deploy from GitHub Repo`.
3. Selecione o repositório.
4. O Railway usará o `railway.json` para instalar as dependências da raiz e do backend.
5. Em `Settings > Networking`, clique em `Generate Domain`.
6. Copie o domínio gerado, por exemplo `https://quiz-platform-production.up.railway.app`.
7. No arquivo `frontend/js/api.js`, configure a URL pública:

```js
const API_URL = 'https://SEU-DOMINIO.up.railway.app/api';
```

8. Envie a alteração do frontend para o Netlify.

O backend local usa um arquivo JSON. No Railway, o disco pode ser recriado durante deploys, então esse armazenamento não é indicado para dados permanentes. Para manter contas definitivamente, adicione um volume Railway ou use um banco persistente.