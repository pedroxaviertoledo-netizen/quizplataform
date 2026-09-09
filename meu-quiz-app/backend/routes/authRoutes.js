const express = require('express');
const router = express.Router();
const { registrar, login, getPerfil, atualizarPerfil } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register', registrar);
router.post('/login', login);
router.get('/perfil', verifyToken, getPerfil);
router.patch('/perfil', verifyToken, atualizarPerfil);

module.exports = router;