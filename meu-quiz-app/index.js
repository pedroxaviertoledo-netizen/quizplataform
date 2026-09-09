const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { garantirQuizzesMedios } = require('./backend/seedMediumQuizzes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';
const DEVELOPER_SIGNUP_PIN = 'Q7M4Z2';
const AVATARES = {
    aurora: { nome: 'Aurora', label: 'AU', preco: 0 },
    oceano: { nome: 'Oceano', label: 'OC', preco: 0 },
    bosque: { nome: 'Bosque', label: 'BO', preco: 0 },
    sol: { nome: 'Solar', label: 'SL', preco: 0 },
    cosmos: { nome: 'Cosmos', label: 'CO', preco: 0 },
    rubi: { nome: 'Rubi', label: 'RU', preco: 0 },
    eclipse: { nome: 'Eclipse', label: 'EC', preco: 250 },
    coral: { nome: 'Coral', label: 'CR', preco: 400 },
    magma: { nome: 'Magma', label: 'MG', preco: 600 },
    nevoa: { nome: 'Névoa', label: 'NE', preco: 800 }
};
const AVATARES_GRATUITOS = Object.entries(AVATARES).filter(([, avatar]) => avatar.preco === 0).map(([id]) => id);
const dataFiles = [
    path.join(__dirname, 'local-db.json'),
    path.join(__dirname, 'backend', '.data', 'local-db.json')
];

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

function readData() {
    const existingFile = dataFiles.find((file) => fs.existsSync(file));
    if (!existingFile) return { users: [], quizzes: [] };
    return JSON.parse(fs.readFileSync(existingFile, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(dataFiles[0], JSON.stringify(data, null, 2));
}

function createId() {
    return crypto.randomBytes(12).toString('hex');
}

function createQuizCode(data) {
    let codigo;
    do {
        codigo = crypto.randomBytes(4).toString('hex').slice(0, 6).toUpperCase();
    } while ((data.quizzes || []).some((quiz) => quiz.codigo === codigo));
    return codigo;
}

function requireAuth(req, res, next) {
    const authorization = req.headers.authorization || '';
    const token = authorization.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Acesso negado. Faça login.' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(403).json({ erro: 'Sessão inválida ou expirada.' });
    }
}

function requireProfessor(req, res, next) {
    const ehProfessor = req.user.role === 'professor' || req.user.roles?.includes('professor');
    if (!ehProfessor) return res.status(403).json({ erro: 'Acesso exclusivo para contas de professores.' });
    next();
}

function requireDeveloper(req, res, next) {
    const ehDesenvolvedor = req.user.role === 'desenvolvedor' || req.user.roles?.includes('desenvolvedor');
    if (!ehDesenvolvedor) return res.status(403).json({ erro: 'Acesso exclusivo para desenvolvedores.' });
    next();
}

function getUser(data, id) {
    return data.users.find((user) => user._id === id);
}

function avataresDoUsuario(user) {
    return [...new Set([...AVATARES_GRATUITOS, ...(user.avataresComprados || [])])].filter((id) => AVATARES[id]);
}

function addNotification(user, notification) {
    user.notificacoes = user.notificacoes || [];
    user.notificacoes.unshift({ _id: createId(), lida: false, criadaEm: new Date().toISOString(), ...notification });
}

function normalizeQuizCodes() {
    const data = readData();
    const codigosUsados = new Set();
    let alterado = false;
    data.quizzes = data.quizzes || [];
    data.quizzes.forEach((quiz) => {
        if (!/^[A-Z0-9]{6}$/.test(String(quiz.codigo || '').toUpperCase()) || codigosUsados.has(String(quiz.codigo).toUpperCase())) {
            quiz.codigo = createQuizCode({ quizzes: data.quizzes.filter((item) => item !== quiz) });
            alterado = true;
        }
        quiz.codigo = String(quiz.codigo).toUpperCase();
        codigosUsados.add(quiz.codigo);
    });
    if (alterado) writeData(data);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ status: 'online', message: 'Backend do Quiz Platform ativo.' });
});

app.post('/api/auth/register', async (req, res) => {
    const { nome, email, senha, role } = req.body || {};
    if (!nome || !email || !senha) return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });

    const data = readData();
    const emailNormalizado = email.trim().toLowerCase();
    if (data.users.some((user) => user.email === emailNormalizado)) {
        return res.status(400).json({ erro: 'E-mail já cadastrado.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const papel = role === 'desenvolvedor' ? 'desenvolvedor' : role === 'professor' ? 'professor' : 'estudante';
    const developerPin = String(req.body?.developerPin || '').trim().toUpperCase();
    if (papel === 'desenvolvedor' && !/^[A-Z0-9]{6}$/.test(developerPin)) return res.status(400).json({ erro: 'O PIN de desenvolvedor deve ter 6 letras e números.' });
    if (papel === 'desenvolvedor' && developerPin !== DEVELOPER_SIGNUP_PIN) return res.status(403).json({ erro: 'PIN de desenvolvedor incorreto.' });
    data.users.push({
        _id: createId(),
        nome: nome.trim(),
        email: emailNormalizado,
        senha: senhaCriptografada,
        role: papel,
        roles: papel === 'professor' ? ['professor', 'estudante'] : papel === 'desenvolvedor' ? ['desenvolvedor', 'professor', 'estudante'] : ['estudante'],
        pontos: 0,
        xp: 0,
        acertos: 0,
        erros: 0,
        avatar: 'aurora'
    });
    writeData(data);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body || {};
    const data = readData();
    const user = data.users.find((item) => item.email === String(email || '').trim().toLowerCase());
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const senhaValida = await bcrypt.compare(senha || '', user.senha);
    if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });

    data.acessos = data.acessos || [];
    data.acessos.push({ userId: user._id, data: new Date().toISOString() });
    data.acessos = data.acessos.slice(-10000);
    writeData(data);

    const roles = user.roles || (user.role === 'desenvolvedor' ? ['desenvolvedor', 'professor', 'estudante'] : user.role === 'professor' ? ['professor', 'estudante'] : ['estudante']);
    const token = jwt.sign({ id: user._id, role: user.role, roles, nome: user.nome }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
        token,
        user: { id: user._id, nome: user.nome, email: user.email, role: user.role, roles, pontos: user.pontos, xp: user.xp || 0, avatar: user.avatar || 'aurora' }
    });
});

app.patch('/api/auth/perfil', requireAuth, (req, res) => {
    const data = readData();
    const user = data.users.find((item) => item._id === req.user.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (req.body.avatar !== undefined) {
        if (!avataresDoUsuario(user).includes(req.body.avatar)) return res.status(403).json({ erro: 'Compre este avatar antes de selecioná-lo.' });
        user.avatar = req.body.avatar;
    }
    if (req.body.nome) user.nome = String(req.body.nome).trim();
    writeData(data);
    const { senha, ...perfil } = user;
    res.json(perfil);
});

app.get('/api/auth/avatares', requireAuth, (req, res) => {
    const data = readData();
    const user = getUser(data, req.user.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json({ xp: Number(user.xp || 0), avataresComprados: avataresDoUsuario(user), catalogo: Object.entries(AVATARES).map(([id, avatar]) => ({ id, ...avatar })) });
});

app.post('/api/auth/avatares/:id/comprar', requireAuth, (req, res) => {
    const data = readData();
    const user = getUser(data, req.user.id);
    const avatar = AVATARES[req.params.id];
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (!avatar) return res.status(404).json({ erro: 'Avatar não encontrado.' });
    if (avatar.preco === 0) return res.json({ mensagem: 'Este avatar já é gratuito.', xp: Number(user.xp || 0), avataresComprados: avataresDoUsuario(user) });
    if (avataresDoUsuario(user).includes(req.params.id)) return res.status(400).json({ erro: 'Você já possui este avatar.' });
    if (Number(user.xp || 0) < avatar.preco) return res.status(400).json({ erro: `Você precisa de ${avatar.preco} XP para comprar este avatar.` });

    user.xp = Number(user.xp || 0) - avatar.preco;
    user.avataresComprados = [...new Set([...(user.avataresComprados || []), req.params.id])];
    writeData(data);
    res.json({ mensagem: `${avatar.nome} comprado com sucesso.`, xp: user.xp, avataresComprados: avataresDoUsuario(user) });
});

app.get('/api/auth/perfil', requireAuth, (req, res) => {
    const user = readData().users.find((item) => item._id === req.user.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    const { senha, ...perfil } = user;
    res.json(perfil);
});

app.get('/api/notificacoes', requireAuth, (req, res) => {
    const user = getUser(readData(), req.user.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(user.notificacoes || []);
});

app.patch('/api/notificacoes/:id/lida', requireAuth, (req, res) => {
    const data = readData();
    const user = getUser(data, req.user.id);
    const notification = user?.notificacoes?.find((item) => item._id === req.params.id);
    if (!notification) return res.status(404).json({ erro: 'Notificação não encontrada.' });
    notification.lida = true;
    writeData(data);
    res.json(notification);
});

app.get('/api/users', requireAuth, requireDeveloper, (req, res) => {
    const data = readData();
    res.json((data.users || []).map(({ senha, ...user }) => user));
});

app.get('/api/desenvolvedor/overview', requireAuth, requireDeveloper, (req, res) => {
    const data = readData();
    const users = data.users || [];
    const feedbacks = data.feedbacks || [];
    const quizzes = (data.quizzes || []).filter((quiz) => quiz.ativo !== false);

    const contarPerfil = (perfil) => users.filter((user) => user.role === perfil || user.roles?.includes(perfil)).length;
    const totalResultados = users.reduce((acumulador, user) => acumulador + (user.ultimosResultados || []).length, 0);
    const totalAcertos = users.reduce((acumulador, user) => acumulador + (user.ultimosResultados || []).reduce((soma, resultado) => soma + Number(resultado.acertos || 0), 0), 0);
    const totalPerguntas = quizzes.reduce((acumulador, quiz) => acumulador + (quiz.perguntas || []).length, 0);
    const xpTotal = users.reduce((acumulador, user) => acumulador + Number(user.xp || 0), 0);
    const taxaAcerto = totalResultados > 0 && totalPerguntas > 0 ? Math.min(100, Math.round((totalAcertos / totalPerguntas) * 100)) : 0;
    const taxaConclusao = totalResultados > 0 ? Math.min(100, Math.round((totalResultados / Math.max(1, users.length * 5)) * 100)) : 0;

    const acessos = data.acessos || [];
    const hoje = new Date().toISOString().slice(0, 10);
    const acessoSemanal = Array.from({ length: 7 }, (_, indice) => {
        const dataReferencia = new Date();
        dataReferencia.setUTCDate(dataReferencia.getUTCDate() - (6 - indice));
        const dataFormatada = dataReferencia.toISOString().slice(0, 10);
        return {
            dia: dataReferencia.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '').slice(0, 3),
            valor: acessos.filter((acesso) => String(acesso.data || '').slice(0, 10) === dataFormatada).length
        };
    });

    const enc = users.reduce((melhor, user) => {
        const xpAtual = Number(user.xp || 0);
        const melhorXp = Number(melhor?.xp || 0);
        return xpAtual > melhorXp ? { nome: user.nome, xp: xpAtual, role: user.role || 'estudante' } : melhor;
    }, { nome: 'Nenhum', xp: 0, role: '-' });

    res.json({
        totalUsuarios: users.length,
        estudantes: contarPerfil('estudante'),
        professores: contarPerfil('professor'),
        desenvolvedores: contarPerfil('desenvolvedor'),
        feedbacksAbertos: feedbacks.filter((item) => item.status === 'aberto').length,
        feedbacksResolvidos: feedbacks.filter((item) => item.status === 'resolvido').length,
        quizzesAtivos: quizzes.length,
        acessosHoje: acessos.filter((acesso) => String(acesso.data || '').slice(0, 10) === hoje).length,
        taxaAcerto,
        taxaConclusao,
        xpTotal,
        metaAcessos: 50,
        metaAcerto: 70,
        metaConclusao: 80,
        metaXp: 2000,
        acessoSemanal,
        metas: [
            { nome: 'Engajamento semanal', valor: `${Math.min(100, Math.max(0, Math.round(((users.length + totalResultados) / Math.max(1, users.length * 8)) * 100))) }%`, progresso: Math.min(100, Math.max(0, Math.round(((users.length + totalResultados) / Math.max(1, users.length * 8)) * 100))), meta: 'Meta: 80%' },
            { nome: 'Acertos de quiz', valor: `${taxaAcerto}%`, progresso: taxaAcerto, meta: 'Meta: 70%' },
            { nome: 'Retenção', valor: `${taxaConclusao}%`, progresso: taxaConclusao, meta: 'Meta: 85%' }
        ],
        topUsuario: enc
    });
});

app.get('/api/feedbacks', requireAuth, requireDeveloper, (req, res) => {
    const data = readData();
    res.json(data.feedbacks || []);
});

app.post('/api/feedbacks', requireAuth, (req, res) => {
    const mensagem = String(req.body?.mensagem || '').trim();
    if (!mensagem) return res.status(400).json({ erro: 'Escreva uma mensagem de feedback.' });
    const data = readData();
    const user = getUser(data, req.user.id);
    data.feedbacks = data.feedbacks || [];
    const feedback = { _id: createId(), userId: user._id, nome: user.nome, email: user.email, mensagem, status: 'aberto', criadoEm: new Date().toISOString() };
    data.feedbacks.unshift(feedback);
    writeData(data);
    res.status(201).json(feedback);
});

app.patch('/api/feedbacks/:id', requireAuth, requireDeveloper, (req, res) => {
    const data = readData();
    const feedback = (data.feedbacks || []).find((item) => item._id === req.params.id);
    if (!feedback) return res.status(404).json({ erro: 'Feedback não encontrado.' });
    feedback.status = req.body.status === 'resolvido' ? 'resolvido' : 'aberto';
    writeData(data);
    res.json(feedback);
});

app.get('/api/turmas', requireAuth, (req, res) => {
    const data = readData();
    const turmas = (data.turmas || []).filter((turma) => turma.professorId === req.user.id || turma.alunos.includes(req.user.id));
    res.json(turmas.map((turma) => ({ ...turma, alunos: turma.alunos.map((id) => { const aluno = getUser(data, id); return aluno ? { id: aluno._id, nome: aluno.nome, email: aluno.email } : null; }).filter(Boolean) })));
});

app.post('/api/turmas', requireAuth, requireProfessor, (req, res) => {
    const nome = String(req.body?.nome || '').trim();
    const colegio = String(req.body?.colegio || '').trim();
    if (!nome || !colegio) return res.status(400).json({ erro: 'Informe o nome da turma e do colégio.' });
    const data = readData();
    data.turmas = data.turmas || [];
    const turma = { _id: createId(), nome, colegio, professorId: req.user.id, alunos: [], criadaEm: new Date().toISOString() };
    data.turmas.push(turma);
    writeData(data);
    res.status(201).json(turma);
});

app.post('/api/turmas/:id/convites', requireAuth, requireProfessor, (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const data = readData();
    const turma = (data.turmas || []).find((item) => item._id === req.params.id && item.professorId === req.user.id);
    const aluno = data.users.find((item) => item.email === email);
    if (!turma) return res.status(404).json({ erro: 'Turma não encontrada.' });
    if (!aluno || aluno.role !== 'estudante') return res.status(404).json({ erro: 'Informe o e-mail de um estudante cadastrado.' });
    const codigo = crypto.randomBytes(4).toString('hex').toUpperCase();
    addNotification(aluno, { tipo: 'convite_turma', titulo: `Convite para a turma ${turma.nome}`, mensagem: `${req.user.nome} convidou você para ${turma.colegio}.`, turmaId: turma._id, codigo, emailDestino: email });
    writeData(data);
    res.status(201).json({ mensagem: `Código enviado para ${email}.`, codigo });
});

app.post('/api/turmas/:id/entrar', requireAuth, (req, res) => {
    const codigo = String(req.body?.codigo || '').trim().toUpperCase();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const data = readData();
    const user = getUser(data, req.user.id);
    const turma = (data.turmas || []).find((item) => item._id === req.params.id);
    const convite = user?.notificacoes?.find((item) => item.tipo === 'convite_turma' && item.turmaId === req.params.id && item.codigo === codigo && item.emailDestino === email);
    if (!turma || !convite || user.email !== email) return res.status(400).json({ erro: 'E-mail ou código do convite inválido.' });
    if (!turma.alunos.includes(user._id)) turma.alunos.push(user._id);
    convite.lida = true;
    addNotification(getUser(data, turma.professorId), { tipo: 'aluno_entrou', titulo: `Novo aluno na turma ${turma.nome}`, mensagem: `${user.nome} entrou usando o código do convite.` });
    writeData(data);
    res.json(turma);
});

app.post('/api/turmas/:id/quizzes', requireAuth, requireProfessor, (req, res) => {
    const data = readData();
    const turma = (data.turmas || []).find((item) => item._id === req.params.id && item.professorId === req.user.id);
    const quiz = data.quizzes.find((item) => item._id === req.body?.quizId);
    if (!turma || !quiz) return res.status(404).json({ erro: 'Turma ou quiz não encontrado.' });
    turma.quizIds = turma.quizIds || [];
    if (!turma.quizIds.includes(quiz._id)) turma.quizIds.push(quiz._id);
    turma.alunos.forEach((alunoId) => addNotification(getUser(data, alunoId), { tipo: 'quiz_turma', titulo: `Novo quiz na turma ${turma.nome}`, mensagem: `${quiz.titulo} foi publicado pelo professor.`, quizId: quiz._id, turmaId: turma._id }));
    writeData(data);
    res.json(turma);
});

app.get('/api/quizzes', requireAuth, (req, res) => {
    const quizzes = readData().quizzes
        .filter((quiz) => quiz.ativo !== false)
        .map(({ perguntas, ...quiz }) => ({
            ...quiz,
            perguntas: perguntas.map(({ respostaCorreta, ...pergunta }) => pergunta)
        }));
    res.json(quizzes);
});

app.get('/api/quizzes/:id', requireAuth, (req, res) => {
    const quiz = readData().quizzes.find((item) => item._id === req.params.id && item.ativo !== false);
    if (!quiz) return res.status(404).json({ erro: 'Quiz não encontrado.' });
    res.json(quiz);
});

app.post('/api/quizzes/criar', requireAuth, (req, res) => {
    const { titulo, categoria, perguntas, tempoPorPergunta, mostrarBotaoContinuar, exigirTelaCheia, materiais, fundoInicio, fundosQuiz } = req.body || {};
    if (!titulo || !categoria || !Array.isArray(perguntas) || perguntas.length < 1) {
        return res.status(400).json({ erro: 'Informe título, categoria e pelo menos uma pergunta.' });
    }
    if (perguntas.some((item) => !item.pergunta || !Array.isArray(item.opcoes) || item.opcoes.length !== 4 || !Number.isInteger(item.respostaCorreta))) {
        return res.status(400).json({ erro: 'Cada pergunta precisa de texto, quatro opções e uma resposta correta.' });
    }
    if (perguntas.some((item) => item.respostaCorreta < 0 || item.respostaCorreta > 3)) {
        return res.status(400).json({ erro: 'A resposta correta deve indicar uma das quatro opções.' });
    }
    const data = readData();
    const codigo = createQuizCode(data);
    const tempoValido = tempoPorPergunta === null || tempoPorPergunta === undefined || (Number.isInteger(tempoPorPergunta) && tempoPorPergunta >= 5 && tempoPorPergunta <= 600);
    if (!tempoValido) return res.status(400).json({ erro: 'O tempo por pergunta deve estar entre 5 e 600 segundos ou ser desativado.' });
    if (mostrarBotaoContinuar !== undefined && typeof mostrarBotaoContinuar !== 'boolean') return res.status(400).json({ erro: 'A configuração de avanço deve ser verdadeira ou falsa.' });
    if (exigirTelaCheia !== undefined && typeof exigirTelaCheia !== 'boolean') return res.status(400).json({ erro: 'A configuração de tela cheia deve ser verdadeira ou falsa.' });
    const tempoPergunta = tempoPorPergunta == null ? null : tempoPorPergunta;
    const quiz = { _id: createId(), titulo: titulo.trim(), categoria: categoria.trim(), criador: req.user.id, codigo, perguntas: perguntas.map((pergunta) => ({ ...pergunta, tempoSegundos: tempoPergunta })), tempoPorPergunta: tempoPergunta, mostrarBotaoContinuar: mostrarBotaoContinuar !== false, exigirTelaCheia: exigirTelaCheia === true, materiais: Array.isArray(materiais) ? materiais : [], fundoInicio: fundoInicio || null, fundosQuiz: Array.isArray(fundosQuiz) ? fundosQuiz : [], ativo: true };
    data.quizzes.push(quiz);
    writeData(data);
    res.status(201).json({ mensagem: 'Quiz criado com sucesso!', quiz, codigo });
});

app.delete('/api/quizzes/:id', requireAuth, (req, res) => {
    const data = readData();
    const quiz = data.quizzes.find((item) => item._id === req.params.id && item.ativo !== false);
    const usuario = getUser(data, req.user.id);
    const ehDesenvolvedor = req.user.role === 'desenvolvedor' || req.user.roles?.includes('desenvolvedor');
    if (!quiz) return res.status(404).json({ erro: 'Quiz não encontrado.' });
    const ehCriador = quiz.criador === req.user.id || quiz.criador === usuario?._id;
    if (!ehCriador && !ehDesenvolvedor) return res.status(403).json({ erro: 'Apenas o criador ou um desenvolvedor pode apagar este quiz.' });
    quiz.ativo = false;
    writeData(data);
    res.json({ mensagem: 'Quiz apagado com sucesso.' });
});

app.get('/api/quizzes/codigo/:codigo', requireAuth, (req, res) => {
    const codigo = req.params.codigo.toUpperCase();
    const quiz = readData().quizzes.find((item) => item.codigo === codigo && item.ativo !== false);
    if (!quiz) return res.status(404).json({ erro: 'Quiz não encontrado com este código.' });
    res.json(quiz);
});

app.post('/api/atividades/compartilhar', requireAuth, (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const data = readData();
    const quiz = data.quizzes.find((item) => item._id === req.body?.quizId && item.ativo !== false);
    const remetente = data.users.find((item) => item._id === req.user.id);
    const destinatario = data.users.find((item) => item.email === email);
    if (!quiz) return res.status(404).json({ erro: 'Quiz não encontrado.' });
    if (!destinatario) return res.status(404).json({ erro: 'Não encontramos um usuário com esse e-mail.' });
    if (destinatario._id === req.user.id) return res.status(400).json({ erro: 'Escolha o e-mail de outro estudante.' });
    destinatario.atividades = destinatario.atividades || [];
    const existente = destinatario.atividades.find((atividade) => atividade.quizId === quiz._id && atividade.status === 'pendente');
    if (existente) return res.status(409).json({ erro: 'Este quiz já está pendente para esse estudante.' });
    const atividade = { _id: createId(), quizId: quiz._id, titulo: quiz.titulo, remetenteId: req.user.id, remetente: remetente?.nome || 'Seu professor', remetenteEmail: remetente?.email || '', status: 'pendente', enviadaEm: new Date().toISOString(), concluidaEm: null };
    destinatario.atividades.push(atividade);
    writeData(data);
    res.status(201).json({ mensagem: `Quiz compartilhado com ${email}.`, atividade });
});

app.get('/api/atividades', requireAuth, (req, res) => {
    const user = readData().users.find((item) => item._id === req.user.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(user.atividades || []);
});

app.get('/api/professor/atividades', requireAuth, requireProfessor, (req, res) => {
    const data = readData();
    const professor = data.users.find((user) => user._id === req.user.id);
    const emailProfessor = professor?.email;
    const atividadesCompartilhadas = data.users.flatMap((user) => (user.atividades || [])
        .filter((atividade) => (atividade.remetenteId === req.user.id || atividade.remetenteEmail === emailProfessor) && atividade.resultado)
        .map((atividade) => ({ ...atividade, aluno: user.nome, alunoEmail: user.email })));
    res.json(atividadesCompartilhadas.sort((a, b) => new Date(b.resultado.concluidaEm) - new Date(a.resultado.concluidaEm)));
});

app.post('/api/quizzes/pontos', requireAuth, (req, res) => {
    const data = readData();
    const user = data.users.find((item) => item._id === req.user.id);
    if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    user.pontos += Number(req.body?.pontos) || 10;
    writeData(data);
    res.json({ mensagem: 'Pontos atualizados!', pontos: user.pontos });
});

app.post('/api/quizzes/:id/resultado', requireAuth, (req, res) => {
    const data = readData();
    const quiz = data.quizzes.find((item) => item._id === req.params.id);
    const user = data.users.find((item) => item._id === req.user.id);
    if (!quiz || !user) return res.status(404).json({ erro: 'Quiz ou usuário não encontrado.' });

    const acertos = Math.max(0, Number(req.body?.acertos) || 0);
    const erros = Math.max(0, Number(req.body?.erros) || 0);
    const xpGanho = (acertos * 10) - (erros * 2);
    user.xp = (user.xp || 0) + xpGanho;
    user.pontos = (user.pontos || 0) + xpGanho;
    user.acertos = (user.acertos || 0) + acertos;
    user.erros = (user.erros || 0) + erros;
    user.ultimosResultados = user.ultimosResultados || [];
    user.ultimosResultados.push({ quizId: quiz._id, titulo: quiz.titulo, acertos, erros, xp: xpGanho, data: new Date().toISOString() });
    user.ultimosResultados = user.ultimosResultados.slice(-20);
    const concluidaEm = new Date().toISOString();
    quiz.resultados = quiz.resultados || [];
    quiz.resultados.push({
        _id: createId(),
        aluno: user.nome,
        alunoEmail: user.email,
        resultado: {
            acertos,
            erros,
            nota: Number(((acertos / quiz.perguntas.length) * 10).toFixed(2)),
            tempoTotalMs: Math.max(0, Number(req.body?.tempoTotalMs) || 0),
            respostas: Array.isArray(req.body?.respostas) ? req.body.respostas : [],
            concluidaEm
        }
    });
    const atividadeId = req.body?.atividadeId;
    if (atividadeId) {
        const atividade = (user.atividades || []).find((item) => item._id === atividadeId && item.quizId === quiz._id);
        if (atividade) {
            atividade.status = 'concluida';
            atividade.concluidaEm = concluidaEm;
            atividade.resultado = {
                acertos,
                erros,
                nota: Number(((acertos / quiz.perguntas.length) * 10).toFixed(2)),
                tempoTotalMs: Math.max(0, Number(req.body?.tempoTotalMs) || 0),
                respostas: Array.isArray(req.body?.respostas) ? req.body.respostas : [],
                concluidaEm: atividade.concluidaEm
            };
        }
    }
    writeData(data);
    res.json({ xp: user.xp, pontos: user.pontos, xpGanho });
});

app.get('/api/ranking', requireAuth, (req, res) => {
    const ranking = readData().users
        .map(({ senha, ...user }) => user)
        .sort((a, b) => (b.xp || 0) - (a.xp || 0))
        .slice(0, 50)
        .map((user, index) => ({ posicao: index + 1, nome: user.nome, xp: user.xp || 0, avatar: user.avatar || 'aurora' }));
    res.json(ranking);
});

app.get('/api/ranking/:quizId', requireAuth, (req, res) => {
    const data = readData();
    const resultados = data.users.flatMap((user) => (user.ultimosResultados || [])
        .filter((resultado) => resultado.quizId === req.params.quizId)
        .map((resultado) => ({ nome: user.nome, avatar: user.avatar || 'aurora', xp: resultado.xp, acertos: resultado.acertos })));
    resultados.sort((a, b) => b.xp - a.xp || b.acertos - a.acertos);
    res.json(resultados.slice(0, 50).map((item, index) => ({ ...item, posicao: index + 1 })));
});

const salasAoVivo = {};
io.on('connection', (socket) => {
    socket.on('criarSala', ({ codigo, quiz }) => {
        if (!codigo || !quiz) return socket.emit('erro', 'Informe o código e o quiz.');
        salasAoVivo[codigo] = { codigo, quiz, hostId: socket.id, jogadores: {}, iniciada: false, pergunta: 0 };
        socket.join(codigo);
        socket.emit('salaCriada', { codigo });
    });
    socket.on('entrarSala', ({ codigo, nome, avatar = 'aurora' }) => {
        const sala = salasAoVivo[codigo];
        if (!sala) return socket.emit('erro', 'Sala não encontrada.');
        sala.jogadores[socket.id] = { id: socket.id, nome, avatar, xp: 0 };
        socket.join(codigo);
        io.to(codigo).emit('estadoSala', { jogadores: Object.values(sala.jogadores), iniciada: sala.iniciada });
    });
    socket.on('iniciarSala', (codigo) => {
        const sala = salasAoVivo[codigo];
        if (!sala || sala.hostId !== socket.id) return;
        sala.iniciada = true;
        io.to(codigo).emit('novaPerguntaAoVivo', { pergunta: sala.quiz.perguntas[0], numero: 1, total: sala.quiz.perguntas.length });
    });
    socket.on('responderAoVivo', ({ codigo, opcao }) => {
        const sala = salasAoVivo[codigo];
        if (!sala || !sala.iniciada) return;
        const jogador = sala.jogadores[socket.id];
        const pergunta = sala.quiz.perguntas[sala.pergunta];
        if (!jogador || !pergunta || jogador.respondeu) return;
        jogador.respondeu = true;
        jogador.xp += opcao === pergunta.respostaCorreta ? 10 : -2;
        socket.emit('resultadoAoVivo', { acertou: opcao === pergunta.respostaCorreta, xp: jogador.xp });
        if (Object.values(sala.jogadores).every((item) => item.respondeu)) avancarSalaAoVivo(sala);
    });
    socket.on('proximaSala', (codigo) => {
        const sala = salasAoVivo[codigo];
        if (sala && sala.hostId === socket.id) avancarSalaAoVivo(sala);
    });
});

function avancarSalaAoVivo(sala) {
    sala.pergunta++;
    Object.values(sala.jogadores).forEach((jogador) => { jogador.respondeu = false; });
    if (sala.pergunta >= sala.quiz.perguntas.length) {
        io.to(sala.codigo).emit('fimAoVivo', Object.values(sala.jogadores).sort((a, b) => b.xp - a.xp));
        return;
    }
    io.to(sala.codigo).emit('novaPerguntaAoVivo', { pergunta: sala.quiz.perguntas[sala.pergunta], numero: sala.pergunta + 1, total: sala.quiz.perguntas.length });
}

const quantidadeQuizzesCriados = garantirQuizzesMedios(readData, writeData, createId);
if (quantidadeQuizzesCriados) console.log(`${quantidadeQuizzesCriados} quizzes médios adicionados ao dashboard.`);
normalizeQuizCodes();

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend público ativo na porta ${PORT}`);
});
