const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registrationController');
const authMiddleware = require('../Middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       required:
 *         - tipo_inscripcion
 *       properties:
 *         tipo_inscripcion:
 *           type: integer
 *           description: Tipo de inscripción (1 para espectadores, 2 para jugadores)
 *         equipos_id_equipo:
 *           type: integer
 *           description: ID del equipo (si aplica, solo para jugadores)
 *       example:
 *         tipo_inscripcion: 2
 *         equipos_id_equipo: 399659
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /registro/{idTorneo}:
 *   post:
 *     summary: Registrar un usuario en un torneo
 *     tags: [Registro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTorneo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del torneo al que se quiere registrar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Registration'
 *     responses:
 *       201:
 *         description: Registro exitoso en el torneo (QR generado)
 *       400:
 *         description: Error en la solicitud (datos inválidos, sin cupo o usuario ya registrado)
 *       401:
 *         description: No autorizado, se requiere autenticación
 */
router.post('/:idTorneo', authMiddleware, registerController.postRegistrationTournament);

module.exports = router;
