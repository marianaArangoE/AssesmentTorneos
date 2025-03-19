const RegistrationService = require('../services/registrationService');

const RegistrationController = {
    async postRegistrationTournament(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }
            const user_id = req.user.id_usuario;
            

            const { tipo_inscripcion, equipos_id_equipo } = req.body;
            const idTorneo = req.params.idTorneo;

            
            const qrBase64 = await RegistrationService.registerForTournament(idTorneo, tipo_inscripcion, equipos_id_equipo, user_id);

            
            const qrBuffer = Buffer.from(qrBase64.split(",")[1], "base64");

            
            res.setHeader("Content-Type", "image/png");
            res.setHeader("Content-Disposition", "inline; filename=qr.png");

            res.send(qrBuffer);

        } catch (error) {
            
            res.status(400).json({ error: error.message });
        }
    },

    async getRegistrationById(req, res) {
        try {
           
            const qrBase64 = await RegistrationService.getRegistrationQRCode(req.params.idRegistro);

            
            const qrBuffer = Buffer.from(qrBase64.split(",")[1], "base64");

            res.setHeader("Content-Type", "image/png");
            res.setHeader("Content-Disposition", "inline; filename=qr.png");

            res.send(qrBuffer);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = RegistrationController;