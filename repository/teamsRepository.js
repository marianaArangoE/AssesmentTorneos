const db = require('../config/db');

const TeamsRepository = {
    getAllTeams() {
        return db.query('SELECT * FROM EQUIPOS');
    },

    getTeamById(idEquipo) {
        return db.query('SELECT * FROM EQUIPOS WHERE id_equipo = $1', [idEquipo]);
    },

    checkExistingTeam(nombre, siglas) {
        return db.query('SELECT * FROM EQUIPOS WHERE nombre = $1 OR siglas = $2', [nombre, siglas]);
    },

    createTeam(id_equipo, nombre, siglas, organizador) {
        return db.query(
            'INSERT INTO EQUIPOS (id_equipo, nombre, siglas, id_creador) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_equipo, nombre, siglas, organizador]
        );
    },

    updateTeam(idEquipo, nombre, siglas) {
        return db.query(
            'UPDATE EQUIPOS SET nombre = $1, siglas = $2 WHERE id_equipo = $3 RETURNING *',
            [nombre, siglas, idEquipo]
        );
    },

    getUserTeam(userId) {
        return db.query('SELECT equipos_id_equipo FROM USUARIOS WHERE id_usuario = $1', [userId]);
    },

    assignUserToTeam(idEquipo, userId) {
        return db.query(
            'UPDATE USUARIOS SET equipos_id_equipo = $1 WHERE id_usuario = $2 RETURNING *',
            [idEquipo, userId]
        );
    },

    getTeamCreator(idEquipo) {
        return db.query('SELECT id_creador FROM EQUIPOS WHERE id_equipo = $1', [idEquipo]);
    },

    removeUserFromTeam(userId) {
        return db.query(
            'UPDATE USUARIOS SET equipos_id_equipo = NULL WHERE id_usuario = $1 RETURNING *',
            [userId]
        );
    }
};

module.exports = TeamsRepository;
