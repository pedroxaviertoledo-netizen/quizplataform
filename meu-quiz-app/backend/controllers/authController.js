const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByEmail, findUserById } = require('../localStore');
const DEVELOPER_SIGNUP_PIN = 'Q7M4Z2';
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';

exports.registrar = async (req, res) => {
    try {
        const { nome, email, senha, role } = req.body;
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: 'Preencha nome, e-mail e senha.' });
        }
        const userExiste = findUserByEmail(email);
        if (userExiste) return res.status(400).json({ erro: 'E-mail já cadastrado.' });

        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const papel = role === 'desenvolvedor' ? 'desenvolvedor' : role === 'professor' ? 'professor' : 'estudante';
        const developerPin = String(req.body?.developerPin || '').trim().toUpperCase();
        if (papel === 'desenvolvedor' && !/^[A-Z0-9]{6}$/.test(developerPin)) return res.status(400).json({ erro: 'O PIN de desenvolvedor deve ter 6 letras e números.' });
        if (papel === 'desenvolvedor' && developerPin !== DEVELOPER_SIGNUP_PIN) return res.status(403).json({ erro: 'PIN de desenvolvedor incorreto.' });
        addUser({ nome, email: email.toLowerCase(), senha: senhaCriptografada, role: papel, roles: papel === 'professor' ? ['professor', 'estudante'] : papel === 'desenvolvedor' ? ['desenvolvedor', 'professor', 'estudante'] : ['estudante'] });
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (err) {
        console.error('Erro ao registrar usuário:', err.message);
        res.status(500).json({ erro: 'Não foi possível cadastrar agora. Verifique se o MongoDB está conectado.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const user = findUserByEmail(email);
        if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta.' });

        const roles = user.roles || (user.role === 'desenvolvedor' ? ['desenvolvedor', 'professor', 'estudante'] : user.role === 'professor' ? ['professor', 'estudante'] : ['estudante']);
        const token = jwt.sign(
            { id: user._id, role: user.role, roles, nome: user.nome },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user._id, nome: user.nome, email: user.email, role: user.role, roles, pontos: user.pontos } });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao realizar login.' });
    }
};

exports.getPerfil = async (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        const { senha, ...perfil } = user;
        res.json(perfil);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar perfil.' });
    }
};

exports.atualizarPerfil = async (req, res) => {
    try {
        const user = findUserById(req.user.id);
        if (!user) return res.status(404).json({ erro: 'Usuário não encontrado.' });
        const avataresPermitidos = ['aurora', 'oceano', 'bosque', 'sol', 'cosmos', 'rubi'];
        if (req.body.avatar !== undefined) {
            if (!avataresPermitidos.includes(req.body.avatar)) return res.status(400).json({ erro: 'Avatar inválido.' });
            user.avatar = req.body.avatar;
        }
        if (req.body.nome) user.nome = String(req.body.nome).trim();
        const { senha, ...perfil } = user;
        const { readStore, writeStore } = require('../localStore');
        const data = readStore();
        const indice = data.users.findIndex((item) => item._id === user._id);
        data.users[indice] = user;
        writeStore(data);
        res.json(perfil);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
    }
};