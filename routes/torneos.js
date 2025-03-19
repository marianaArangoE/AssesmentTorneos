const express = require('express');
const router = express.Router();
const torneosController = require('../controllers/torneosController');
const authMiddleware = require('../Middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Torneos
 *   description: Endpoints para gestión de torneos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Torneo:
 *       type: object
 *       required:
 *         - nombre
 *         - fecha_inicio
 *         - fecha_fin
 *         - video_juegos_id
 *         - its_free
 *         - limite_equipos
 *         - limite_views
 *         - plataforma_id
 *         - categorias_id
 *         - descripcion
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del torneo
 *         fecha_inicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del torneo (YYYY-MM-DD)
 *         fecha_fin:
 *           type: string
 *           format: date
 *           description: Fecha de finalización del torneo (YYYY-MM-DD)
 *         video_juegos_id:
 *           type: integer
 *           description: ID del videojuego asociado al torneo
 *         its_free:
 *           type: string
 *           enum: [T, F]
 *           description: Indica si el torneo es gratuito (T) o de pago (F)
 *         limite_equipos:
 *           type: integer
 *           description: Número máximo de equipos que pueden participar
 *         limite_views:
 *           type: integer
 *           description: Número máximo de espectadores permitidos
 *         plataforma_id:
 *           type: integer
 *           description: ID de la plataforma en la que se juega el torneo
 *         categorias_id:
 *           type: integer
 *           description: ID de la categoría del torneo
 *         descripcion:
 *           type: string
 *           description: Descripción del torneo
 *       example:
 *         nombre: "Torneo Valorant Champions"
 *         fecha_inicio: "2025-04-10"
 *         fecha_fin: "2025-04-20"
 *         video_juegos_id: 7
 *         its_free: "T"
 *         limite_equipos: 16
 *         limite_views: 500
 *         plataforma_id: 3
 *         categorias_id: 2
 *         descripcion: "Torneo internacional con los mejores jugadores de Valorant."
 */

/**
 * @swagger
 * /torneos:
 *   get:
 *     summary: Obtener la lista de torneos
 *     tags: [Torneos]
 *     parameters:
 *       - in: query
 *         name: ViewAll
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: "Si se debe ver todos los torneos (true) o solo los activos (false). Por defecto: true."
 *       - in: query
 *         name: Order
 *         schema:
 *           type: string
 *           enum: ["ASC", "DESC"]
 *         description: "Orden de los torneos por fecha. ASC para más antiguos primero, DESC para más recientes primero. Por defecto: ASC."
 *     responses:
 *       200:
 *         description: Lista de torneos obtenida exitosamente
 *       400:
 *         description: Error en la solicitud (parámetros inválidos)
 *       500:
 *         description: Error en el servidor
 */
router.get('/', torneosController.getTournaments);
/**
 * @swagger
 * /torneos/{idTorneo}:
 *   get:
 *     summary: Obtener detalles de un torneo por su ID
 *     tags: [Torneos]
 *     parameters:
 *       - in: path
 *         name: idTorneo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del torneo a consultar
 *     responses:
 *       200:
 *         description: Información del torneo obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_torneo:
 *                   type: integer
 *                   description: ID del torneo
 *                 nombre:
 *                   type: string
 *                   description: Nombre del torneo
 *                 fecha_inicio:
 *                   type: string
 *                   format: date
 *                   description: Fecha de inicio del torneo
 *                 fecha_fin:
 *                   type: string
 *                   format: date
 *                   description: Fecha de finalización del torneo
 *                 video_juegos_id:
 *                   type: integer
 *                   description: ID del videojuego asociado al torneo
 *                 its_free:
 *                   type: string
 *                   enum: ["T", "F"]
 *                   description: Indica si el torneo es gratuito (T) o de pago (F)
 *                 limite_equipos:
 *                   type: integer
 *                   description: Límite de equipos en el torneo
 *                 limite_views:
 *                   type: integer
 *                   description: Límite de espectadores permitidos en el torneo
 *                 plataformas_id_plataforma:
 *                   type: integer
 *                   description: ID de la plataforma en la que se juega el torneo
 *                 categorias_id_categoria:
 *                   type: integer
 *                   description: ID de la categoría del torneo
 *                 descripcion:
 *                   type: string
 *                   description: Descripción del torneo
 *                 organizador:
 *                   type: integer
 *                   description: ID del organizador del torneo
 *       404:
 *         description: Torneo no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.get('/:idTorneo', torneosController.getTournamentById);

/**
 * @swagger
 * /torneos/crearTorneo:
 *   post:
 *     summary: Crear un nuevo torneo
 *     tags: [Torneos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Torneo'
 *     responses:
 *       201:
 *         description: Torneo creado exitosamente
 *       400:
 *         description: Error en la solicitud (datos inválidos)
 *       401:
 *         description: No autorizado, se requiere autenticación
 */
router.post('/crearTorneo', authMiddleware, torneosController.postCreateTournament);

/**
 * @swagger
 * /torneos/update/{idTorneo}:
 *   put:
 *     summary: Actualizar los detalles de un torneo
 *     tags: [Torneos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idTorneo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del torneo a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre del torneo (opcional)
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de inicio (opcional)
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de finalización (opcional)
 *               video_juegos_id:
 *                 type: integer
 *                 description: ID del videojuego asociado al torneo (opcional)
 *               its_free:
 *                 type: string
 *                 enum: [T, F]
 *                 description: Indica si el torneo es gratuito o de pago (opcional)
 *               limite_equipos:
 *                 type: integer
 *                 description: Nuevo límite de equipos (opcional)
 *               limite_views:
 *                 type: integer
 *                 description: Nuevo límite de espectadores (opcional)
 *               plataforma_id:
 *                 type: integer
 *                 description: Nueva plataforma donde se jugará el torneo (opcional)
 *               categorias_id:
 *                 type: integer
 *                 description: Nueva categoría del torneo (opcional)
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del torneo (opcional)
 *             example:
 *               nombre: "Torneo Valorant Master"
 *               fecha_inicio: "2025-05-01"
 *               fecha_fin: "2025-05-10"
 *               video_juegos_id: 7
 *               its_free: "T"
 *               limite_equipos: 32
 *               limite_views: 1000
 *               plataforma_id: 5
 *               categorias_id: 3
 *               descripcion: "Torneo actualizado con más cupos y nuevas reglas."
 *     responses:
 *       200:
 *         description: Torneo actualizado exitosamente
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado, se requiere autenticación
 *       404:
 *         description: Torneo no encontrado
 */
router.put('/update/:idTorneo', authMiddleware, torneosController.updateTournament);

module.exports = router;
