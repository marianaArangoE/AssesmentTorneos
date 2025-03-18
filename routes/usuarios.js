const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../Middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - id_usuario
 *         - nombre
 *         - correo
 *         - contrasena
 *         - apodo
 *       properties:
 *         id_usuario:
 *           type: integer
 *           description: ID del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         correo:
 *           type: string
 *           description: Correo del usuario
 *         contrasena:
 *           type: string
 *           description: Contraseña del usuario
 *         apodo:
 *           type: string
 *           description: Apodo del usuario
 *         equipos_id_equipo:
 *           type: integer
 *           description: ID del equipo del usuario (puede ser null)
 *       example:
 *         id_usuario: 129139734
 *         nombre: "mae111"
 *         correo: "arang600@asdasdag"
 *         contrasena: "1234"
 *         apodo: "nana"
 *         equipos_id_equipo: null
 *     Login:
 *       type: object
 *       required:
 *         - correo
 *         - contrasena
 *       properties:
 *         correo:
 *           type: string
 *           description: Correo del usuario
 *         contrasena:
 *           type: string
 *           description: Contraseña del usuario
 *       example:
 *         correo: "arang600@asdasdag"
 *         contrasena: "1234"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/', usuariosController.createUsuario);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', usuariosController.login);

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/me', authMiddleware, usuariosController.getUsuario);

module.exports = router;
