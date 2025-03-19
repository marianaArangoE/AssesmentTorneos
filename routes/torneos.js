const express = require('express');
const router = express.Router();
const torneosController = require('../controllers/torneosController');
const authMiddleware = require('../Middleware/authMiddleware');

router.get('/', torneosController.getTournaments);
router.get('/:idTorneo', torneosController.getTournamentById);
//router.get('/juego/:nombreJuego', torneosController.getTournamentsByGame);
router.post('/crearTorneo', authMiddleware, torneosController.postCreateTournament);
router.put('/update/:idTorneo',authMiddleware, torneosController.updateTournament);


module.exports = router;