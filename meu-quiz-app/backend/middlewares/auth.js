const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'minha_chave_secreta_super_segura_123';

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    
    try {
        const decodificado = jwt.verify(token, JWT_SECRET);
        req.user = decodificado;
        next();
    } catch (err) {
        res.status(403).json({ erro: 'Token inválido ou expirado.' });
    }
};

exports.isTeacherOrDev = (req, res, next) => {
    if (req.user.role !== 'professor' && req.user.role !== 'desenvolvedor') {
        return res.status(403).json({ erro: 'Acesso restrito. Apenas professores ou desenvolvedores.' });
    }
    next();
};