const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../Middleware/authMiddleware');


router.post('/', usuariosController.createUsuario);
router.post('/login', usuariosController.login);
router.get('/me', authMiddleware, usuariosController.getUsuario);


module.exports = router;
