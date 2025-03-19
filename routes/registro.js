const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registrationController');
const authMiddleware = require('../Middleware/authMiddleware');


router.post('/:idTorneo',authMiddleware, registerController.postRegistrationTournament);
router.get('/registro/:idRegistro', registerController.getRegistrationById);



module.exports = router;