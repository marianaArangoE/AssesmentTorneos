const TournamentService = require('../services/tournamentService');

const tournamentController = {
    getTournaments: async (req, res, next) => {
        try {
            const tournaments = await TournamentService.getTournaments(req.query.ViewAll, req.query.Order);
            res.json({ Torneos: tournaments.rows });
        } catch (error) {
            next(error);
        }
    },

    getTournamentById: async (req, res, next) => {
        try {
            const tournament = await TournamentService.getTournamentById(req.params.idTorneo);
            res.json(tournament);
        } catch (error) {
            next(error);
        }
    },

    getTournamentsByGame: async (req, res, next) => {
        try {
            const tournaments = await TournamentService.getTournamentsByGame(req.params.nombreJuego);
            res.json({ Torneos: tournaments });
        } catch (error) {
            next(error);
        }
    },

    postCreateTournament: async (req, res, next) => {
        try {
            await TournamentService.createTournament(req.body, req.headers.authorization);
            res.json({ message: 'Torneo creado correctamente' });
        } catch (error) {
            next(error);
        }
    },

    putUpdateTournament: async (req, res, next) => {
        try {
            await TournamentService.updateTournament(req.params.idTorneo, req.body, req.headers.authorization);
            res.json({ message: 'Torneo actualizado correctamente' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = tournamentController;
