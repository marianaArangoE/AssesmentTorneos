const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registrationController');
const authMiddleware = require('../Middleware/authMiddleware');


router.post('/:idTorneo', registerController.postRegistrationTournament);



module.exports = router;