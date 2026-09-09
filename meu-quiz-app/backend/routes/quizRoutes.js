const express = require('express');
const router = express.Router();
const { criarQuiz, listarQuizzes, obterQuizPorId, obterQuizPorCodigo, adicionarPontos, compartilharQuiz } = require('../controllers/quizController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, listarQuizzes);
router.get('/codigo/:codigo', verifyToken, obterQuizPorCodigo); // Nova rota
router.get('/:id', verifyToken, obterQuizPorId);
router.post('/criar', verifyToken, criarQuiz); // Rota liberada para todos
router.post('/pontos', verifyToken, adicionarPontos);
router.post('/compartilhar', verifyToken, compartilharQuiz);

module.exports = router;