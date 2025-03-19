const RegistrationService = require('../services/registrationService');

const RegistrationController = {
    async postRegistrationTournament(req, res) {
        try {
            console.log("🟢 req.user:", req.user);

            if (!req.user) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const user_id = req.user.id_usuario;
            console.log("🟢 ID del usuario autenticado:", user_id);

            const { tipo_inscripcion, equipos_id_equipo } = req.body;
            const idTorneo = req.params.idTorneo;

            // Generar QR en base64
            const qrBase64 = await RegistrationService.registerForTournament(idTorneo, tipo_inscripcion, equipos_id_equipo, user_id);

            // Convertir base64 a buffer para enviar la imagen correctamente
            const qrBuffer = Buffer.from(qrBase64.split(",")[1], "base64");

            // Configurar headers para que Postman detecte la imagen
            res.setHeader("Content-Type", "image/png");
            res.setHeader("Content-Disposition", "inline; filename=qr.png");

            res.send(qrBuffer);

        } catch (error) {
            console.error("🔴 Error en postRegistrationTournament:", error.message);
            res.status(400).json({ error: error.message });
        }
    },

    async getRegistrationById(req, res) {
        try {
            // Obtener QR desde la BD en base64
            const qrBase64 = await RegistrationService.getRegistrationQRCode(req.params.idRegistro);

            // Convertir base64 a buffer para que Postman lo renderice bien
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