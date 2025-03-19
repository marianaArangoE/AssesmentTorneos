const TeamsService = require('../services/teamsService');

const TeamsController = {
    async getTeams(req, res) {
        try {
            res.json(await TeamsService.getTeams());
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getTeamById(req, res) {
        try {
            res.json(await TeamsService.getTeamById(req.params.idEquipo));
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async createTeam(req, res) {
        try {
            const { nombre, siglas } = req.body;
            if (!nombre || !siglas) {
                return res.status(400).json({ error: "Los campos (nombre, siglas) son obligatorios" });
            }

            const organizador = req.user.id_usuario;
            res.status(201).json(await TeamsService.createTeam(nombre, siglas, organizador));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async updateTeam(req, res) {
        try {
            const { idEquipo } = req.params;
            const { nombre_new, siglas_new } = req.body;
            const userId = req.user.id_usuario;

            res.json(await TeamsService.updateTeam(idEquipo, nombre_new, siglas_new, userId));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async registerUserToTeam(req, res) {
        try {
            const { idEquipo } = req.params;
            const userId = req.user.id_usuario;

            res.json(await TeamsService.registerUserToTeam(idEquipo, userId));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async removeUserFromTeam(req, res) {
        try {
            const { idEquipo } = req.params;
            const { id_usuario } = req.body;
            const organizerId = req.user.id_usuario;

            if (!id_usuario) {
                return res.status(400).json({ error: 'Debes proporcionar el id_usuario' });
            }

            res.json(await TeamsService.removeUserFromTeam(idEquipo, id_usuario, organizerId));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async leaveTeam(req, res) {
        try {
            const { idEquipo } = req.params;
            const userId = req.user.id_usuario;

            res.json(await TeamsService.leaveTeam(idEquipo, userId));
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = TeamsController;
