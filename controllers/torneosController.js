const TournamentService = require('../services/tournamentService');

const TournamentController = {
    async getTournaments(req, res) {
        try {
            res.json({ Torneos: await TournamentService.getTournaments(req.query.ViewAll, req.query.Order) });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getTournamentById(req, res) {
        try {
            const torneo = await TournamentService.getTournamentById(req.params.idTorneo);
    
            if (!torneo) {
                return res.status(404).json({ error: "Torneo no encontrado" });
            }
    
            res.json(torneo);
        } catch (error) {
            console.error("🔴 Error en getTournamentById:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    },

    async postCreateTournament(req, res) {  // 🔥 CORREGIDO AQUÍ
        try {
            const organizador = req.user.id_usuario;
            const requestData = { ...req.body, organizador };

            console.log("Datos enviados al servicio:", requestData);

            res.json(await TournamentService.createTournament(requestData));  // 🔥 Ahora está usando la función correcta
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async updateTournament(req, res) {
        try {
            console.log("🟢 req.user:", req.user); // Agrega esto para ver si req.user está presente
            const { idTorneo } = req.params;
            const userId = req.user?.id_usuario;
    
            if (!userId) {
                return res.status(401).json({ error: "Usuario no autenticado" });
            }
    
            console.log("🟢 ID del usuario autenticado:", userId);
            console.log("🟢 Datos recibidos para actualizar:", req.body);
    
            const updatedTournament = await TournamentService.updateTournament(idTorneo, req.body, userId);
        
            res.json({ message: 'Torneo actualizado correctamente', updatedTournament });
        } catch (error) {
            console.error("🔴 Error en updateTournament:", error.message);
            res.status(400).json({ error: error.message });
        }
    }
    
    
    
};

module.exports = TournamentController;
