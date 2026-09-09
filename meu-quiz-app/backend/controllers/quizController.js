const { addQuizzes, findQuizByCode, findQuizById, listQuizzes, updateUserPoints, readStore, writeStore, createId } = require('../localStore');

exports.criarQuiz = async (req, res) => {
    try {
        const { titulo, categoria, perguntas, tempoPorPergunta, mostrarBotaoContinuar, exigirTelaCheia, materiais, fundoInicio, fundosQuiz } = req.body;
        if (!titulo || !categoria || !Array.isArray(perguntas) || perguntas.length < 1) {
            return res.status(400).json({ erro: 'Informe título, categoria e pelo menos uma pergunta.' });
        }
        if (perguntas.some((item) => !item.pergunta || !Array.isArray(item.opcoes) || item.opcoes.length !== 4 || !Number.isInteger(item.respostaCorreta))) {
            return res.status(400).json({ erro: 'Cada pergunta precisa de texto, quatro opções e uma resposta correta.' });
        }
        if (tempoPorPergunta !== null && tempoPorPergunta !== undefined && (!Number.isInteger(tempoPorPergunta) || tempoPorPergunta < 5 || tempoPorPergunta > 600)) {
            return res.status(400).json({ erro: 'O tempo por pergunta deve estar entre 5 e 600 segundos.' });
        }
        if (perguntas.some((item) => item.tempoSegundos !== null && item.tempoSegundos !== undefined && (!Number.isInteger(item.tempoSegundos) || item.tempoSegundos < 5 || item.tempoSegundos > 600))) {
            return res.status(400).json({ erro: 'O tempo de cada pergunta deve estar entre 5 e 600 segundos.' });
        }
        if (mostrarBotaoContinuar !== undefined && typeof mostrarBotaoContinuar !== 'boolean') {
            return res.status(400).json({ erro: 'A configuração do botão Continuar deve ser verdadeira ou falsa.' });
        }
        if (exigirTelaCheia !== undefined && typeof exigirTelaCheia !== 'boolean') {
            return res.status(400).json({ erro: 'A configuração de tela cheia deve ser verdadeira ou falsa.' });
        }
        // Gera um codigo aleatorio de 6 caracteres (letras e numeros)
        const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const tempoPergunta = tempoPorPergunta == null ? null : tempoPorPergunta;
        const novoQuiz = { titulo, categoria, criador: req.user.id, perguntas: perguntas.map((pergunta) => ({ ...pergunta, tempoSegundos: tempoPergunta })), codigo, tempoPorPergunta: tempoPergunta, mostrarBotaoContinuar: mostrarBotaoContinuar !== false, exigirTelaCheia: exigirTelaCheia === true, materiais: Array.isArray(materiais) ? materiais : [], fundoInicio: fundoInicio || null, fundosQuiz: Array.isArray(fundosQuiz) ? fundosQuiz : [] };
        addQuizzes([novoQuiz]);
        const quizCriado = findQuizByCode(codigo);
        res.status(201).json({ mensagem: 'Quiz criado com sucesso!', quiz: quizCriado, codigo });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao criar quiz.' });
    }
};

exports.listarQuizzes = async (req, res) => {
    try {
        const quizzes = listQuizzes().map(({ perguntas, ...quiz }) => ({
            ...quiz,
            perguntas: perguntas.map(({ respostaCorreta, ...pergunta }) => pergunta)
        }));
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar quizzes.' });
    }
};

exports.obterQuizPorId = async (req, res) => {
    try {
        const quiz = findQuizById(req.params.id);
        if (!quiz) return res.status(404).json({ erro: 'Quiz nao encontrado.' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar o quiz.' });
    }
};

exports.obterQuizPorCodigo = async (req, res) => {
    try {
        const quiz = findQuizByCode(req.params.codigo);
        if (!quiz) return res.status(404).json({ erro: 'Quiz nao encontrado com este codigo.' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar o quiz.' });
    }
};

exports.adicionarPontos = async (req, res) => {
    try {
        const { pontos } = req.body;
        const user = updateUserPoints(req.user.id, pontos || 10);
        if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        res.json({ mensagem: 'Pontos atualizados!', pontos: user.pontos });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar pontos.' });
    }
};

exports.compartilharQuiz = async (req, res) => {
    try {
        const email = String(req.body?.email || '').trim().toLowerCase();
        const data = readStore();
        const quiz = data.quizzes.find((item) => item._id === req.body?.quizId && item.ativo !== false);
        const remetente = data.users.find((item) => item._id === req.user.id);
        const destinatario = data.users.find((item) => item.email.toLowerCase() === email);
        if (!quiz) return res.status(404).json({ erro: 'Quiz não encontrado.' });
        if (!destinatario) return res.status(404).json({ erro: 'Não encontramos um usuário com esse e-mail.' });
        if (destinatario._id === req.user.id) return res.status(400).json({ erro: 'Escolha o e-mail de outro estudante.' });
        destinatario.atividades = destinatario.atividades || [];
        if (destinatario.atividades.some((atividade) => atividade.quizId === quiz._id && atividade.status === 'pendente')) {
            return res.status(409).json({ erro: 'Este quiz já está pendente para esse estudante.' });
        }
        const atividade = { _id: createId(), quizId: quiz._id, titulo: quiz.titulo, remetenteId: req.user.id, remetente: remetente?.nome || 'Seu professor', remetenteEmail: remetente?.email || '', status: 'pendente', enviadaEm: new Date().toISOString(), concluidaEm: null };
        destinatario.atividades.push(atividade);
        writeStore(data);
        res.status(201).json({ mensagem: `Quiz compartilhado com ${email}.`, atividade });
    } catch (err) {
        res.status(500).json({ erro: 'Não foi possível compartilhar o quiz.' });
    }
};