const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teamsController');
const authMiddleware = require('../Middleware/authMiddleware');

//rutas
router.get('/', teamsController.getTeams);
router.get('/:idEquipo', teamsController.getTeamById);
router.post('/crear',authMiddleware, teamsController.createTeam);
router.put('/editar/:idEquipo',authMiddleware, teamsController.updateTeam);
router.put('/agregar/:idEquipo',authMiddleware, teamsController.registerUserToTeam);
router.put('/eliminar/:idEquipo',authMiddleware, teamsController.removeUserFromTeam);
router.put('/salir/:idEquipo',authMiddleware, teamsController.leaveTeam);

module.exports = router;