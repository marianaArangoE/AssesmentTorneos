const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const authMiddleware = require('../Middleware/authMiddleware');

//rutas
router.get('/', teamsController.getTeams);
router.get('/:idEquipo', teamsController.getEquiposById);
router.post('/crear',authMiddleware, teamsController.postCrearEquipos);
router.put('/editar/:idEquipo',authMiddleware, teamsController.putUpdateTeam);
router.put('/agregar/:idEquipo',authMiddleware, teamsController.putRegisterToTeam);
router.put('/eliminar/:idEquipo',authMiddleware, teamsController.putRemoveUserFromTeam);
router.put('/salir/:idEquipo',authMiddleware, teamsController.putLeaveTeam);

module.exports = router;