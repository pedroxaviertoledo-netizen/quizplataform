const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const { garantirQuizzesMedios } = require('./seedMediumQuizzes');
const { createId, readStore, writeStore } = require('./localStore');

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.post('/api/atividades/compartilhar', (req, res, next) => {
    req.url = '/compartilhar';
    quizRoutes(req, res, next);
});

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const salas = {};

io.on('connection', (socket) => {
    // Criar Sala (Host / Professor)
    socket.on('criarSala', ({ codigo, quizData } = {}) => {
        if (!codigo || !quizData || !Array.isArray(quizData.perguntas) || !quizData.perguntas.length) {
            return socket.emit('erro', 'Dados do quiz inválidos.');
        }
        if (salas[codigo]) return socket.emit('erro', 'Este código de sala já está em uso.');

        salas[codigo] = {
            hostId: socket.id,
            quiz: quizData,
            jogadores: {},
            perguntaAtual: 0,
            tempoRestante: 40,
            intervaloTempo: null,
            respostasPergunta: { 0: 0, 1: 0, 2: 0, 3: 0 }
        };
        socket.join(codigo);
        socket.emit('salaCriada', { codigo });
    });

    // Entrar na Sala (Jogador)
    socket.on('entrarSala', ({ codigo, nome } = {}) => {
        codigo = String(codigo || '').trim().toUpperCase();
        nome = String(nome || '').trim();
        const sala = salas[codigo];
        if (!sala) return socket.emit('erro', 'Sala não encontrada!');
        if (!nome) return socket.emit('erro', 'Informe um nome para entrar.');

        sala.jogadores[socket.id] = {
            id: socket.id,
            nome,
            pontos: 0,
            streak: 0,
            powerUps: { dobro: true, metade: true, escudo: true },
            usouEscudo: false,
            multiplicador: 1
        };

        socket.join(codigo);
        io.to(codigo).emit('atualizarJogadores', Object.values(sala.jogadores));
    });

    // Remover Jogador (Ação do Host)
    socket.on('expulsarJogador', ({ codigo, jogadorId }) => {
        const sala = salas[codigo];
        if (sala && sala.hostId === socket.id) {
            delete sala.jogadores[jogadorId];
            io.to(jogadorId).emit('expulso');
            io.to(codigo).emit('atualizarJogadores', Object.values(sala.jogadores));
        }
    });

    // Iniciar Jogo (Host)
    socket.on('iniciarJogo', (codigo) => {
        const sala = salas[codigo];
        if (!sala || sala.hostId !== socket.id) return;

        iniciarPergunta(codigo);
    });

    // Resposta do Jogador
    socket.on('responder', ({ codigo, opcaoIndex } = {}) => {
        const sala = salas[codigo];
        if (!sala) return;

        const jogador = sala.jogadores[socket.id];
        const pergunta = sala.quiz.perguntas[sala.perguntaAtual];
        if (!jogador || !pergunta || jogador.respondeu) return;
        if (!Number.isInteger(opcaoIndex) || opcaoIndex < 0 || opcaoIndex > 3) return;

        jogador.respondeu = true;
        const acertou = opcaoIndex === pergunta.correta;

        sala.respostasPergunta[opcaoIndex] = (sala.respostasPergunta[opcaoIndex] || 0) + 1;

        if (acertou) {
            jogador.streak += 1;
            const pontosBase = 100 + (sala.tempoRestante * 10);
            jogador.pontos += pontosBase * jogador.multiplicador;
        } else {
            if (jogador.usouEscudo) {
                jogador.usouEscudo = false;
            } else {
                jogador.streak = 0;
            }
        }

        jogador.multiplicador = 1;
        socket.emit('resultadoResposta', { acertou, pontos: jogador.pontos, streak: jogador.streak });
        io.to(sala.hostId).emit('estatisticasRespostas', sala.respostasPergunta);
    });

    // Ativar Power-Up
    socket.on('usarPowerUp', ({ codigo, tipo }) => {
        const sala = salas[codigo];
        if (!sala) return;
        const jogador = sala.jogadores[socket.id];
        if (!jogador || !jogador.powerUps[tipo]) return;

        jogador.powerUps[tipo] = false;

        if (tipo === 'dobro') jogador.multiplicador = 2;
        if (tipo === 'escudo') jogador.usouEscudo = true;
        
        socket.emit('powerUpAplicado', { tipo });
    });

    // Avançar Pergunta (Host)
    socket.on('proximaPergunta', (codigo) => {
        const sala = salas[codigo];
        if (!sala) return;

        sala.perguntaAtual++;
        if (sala.perguntaAtual < sala.quiz.perguntas.length) {
            iniciarPergunta(codigo);
        } else {
            clearInterval(sala.intervaloTempo);
            const ranking = Object.values(sala.jogadores).sort((a, b) => b.pontos - a.pontos);
            io.to(codigo).emit('fimDeJogo', ranking);
        }
    });

    function iniciarPergunta(codigo) {
        const sala = salas[codigo];
        sala.tempoRestante = 40;
        sala.respostasPergunta = { 0: 0, 1: 0, 2: 0, 3: 0 };
        Object.values(sala.jogadores).forEach((jogador) => { jogador.respondeu = false; });
        clearInterval(sala.intervaloTempo);

        io.to(codigo).emit('novaPergunta', {
            pergunta: sala.quiz.perguntas[sala.perguntaAtual],
            numero: sala.perguntaAtual + 1,
            total: sala.quiz.perguntas.length
        });

        sala.intervaloTempo = setInterval(() => {
            sala.tempoRestante--;
            io.to(codigo).emit('tempoAtualizado', sala.tempoRestante);

            if (sala.tempoRestante <= 0) {
                clearInterval(sala.intervaloTempo);
                io.to(codigo).emit('tempoEsgotado');
            }
        }, 1000);
    }
});

const PORT = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
    const quantidadeQuizzesCriados = garantirQuizzesMedios(readStore, writeStore, createId);
    if (quantidadeQuizzesCriados) console.log(`${quantidadeQuizzesCriados} quizzes obrigatórios criados.`);
    console.log('Armazenamento local ativo em backend/.data/local-db.json.');
    server.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
}

iniciarServidor().catch((erro) => {
    console.error('Falha ao iniciar o backend:', erro.message);
    process.exit(1);
});