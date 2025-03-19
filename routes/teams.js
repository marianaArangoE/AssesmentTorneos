const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const authMiddleware = require('../Middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       required:
 *         - nombre
 *         - siglas
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del equipo
 *         siglas:
 *           type: string
 *           description: Siglas o abreviatura del equipo
 *         id_creador:
 *           type: integer
 *           description: ID del usuario que creó el equipo
 *       example:
 *         nombre: "Team Phoenix"
 *         siglas: "TPX"
 *         id_creador: 129139734
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Obtener la lista de equipos
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: Lista de equipos obtenida exitosamente
 *       500:
 *         description: Error en el servidor
 */
router.get('/', teamsController.getTeams);

/**
 * @swagger
 * /teams/{idEquipo}:
 *   get:
 *     summary: Obtener detalles de un equipo por su ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del equipo a consultar
 *     responses:
 *       200:
 *         description: Información del equipo obtenida exitosamente
 *       404:
 *         description: Equipo no encontrado
 */
router.get('/:idEquipo', teamsController.getTeamById);

/**
 * @swagger
 * /teams/crear:
 *   post:
 *     summary: Crear un nuevo equipo
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       201:
 *         description: Equipo creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/crear', authMiddleware, teamsController.createTeam);

/**
 * @swagger
 * /teams/editar/{idEquipo}:
 *   put:
 *     summary: Editar los detalles de un equipo
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del equipo a editar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_new:
 *                 type: string
 *                 description: Nuevo nombre del equipo
 *               siglas_new:
 *                 type: string
 *                 description: Nueva sigla del equipo
 *             example:
 *               nombre_new: "Team Renegades"
 *               siglas_new: "TRG"
 *     responses:
 *       200:
 *         description: Equipo actualizado correctamente
 *       400:
 *         description: No tienes permisos para modificar este equipo
 */
router.put('/editar/:idEquipo', authMiddleware, teamsController.updateTeam);

/**
 * @swagger
 * /teams/agregar/{idEquipo}:
 *   put:
 *     summary: Agregar un usuario a un equipo
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del equipo al que se agregará el usuario
 *     responses:
 *       200:
 *         description: Usuario agregado al equipo correctamente
 *       400:
 *         description: Error al agregar usuario al equipo
 */
router.put('/agregar/:idEquipo', authMiddleware, teamsController.registerUserToTeam);

/**
 * @swagger
 * /teams/eliminar/{idEquipo}:
 *   put:
 *     summary: Eliminar un usuario de un equipo (solo el dueño del equipo puede hacerlo)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del equipo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 description: ID del usuario a eliminar del equipo
 *             example:
 *               id_usuario: 987654
 *     responses:
 *       200:
 *         description: Usuario eliminado del equipo correctamente
 *       400:
 *         description: No tienes permisos para eliminar usuarios del equipo
 */
router.put('/eliminar/:idEquipo', authMiddleware, teamsController.removeUserFromTeam);

/**
 * @swagger
 * /teams/salir/{idEquipo}:
 *   put:
 *     summary: Un usuario abandona un equipo
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idEquipo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del equipo del cual el usuario quiere salir
 *     responses:
 *       200:
 *         description: Usuario salió del equipo correctamente
 *       400:
 *         description: No puedes salir del equipo si eres el dueño
 */
router.put('/salir/:idEquipo', authMiddleware, teamsController.leaveTeam);

module.exports = router;
