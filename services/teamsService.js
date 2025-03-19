const TeamsRepository = require('../repository/teamsRepository');

const TeamsService = {
    async getTeams() {
        return (await TeamsRepository.getAllTeams()).rows;
    },

    async getTeamById(idEquipo) {
        if (!idEquipo) throw new Error('El ID del equipo es requerido.');

        const team = await TeamsRepository.getTeamById(idEquipo);
        if (!team.rows.length) throw new Error('Equipo no encontrado');

        return team.rows[0];
    },

    async createTeam(nombre, siglas, organizador) {
        if (!nombre || !siglas || !organizador) {
            throw new Error('Todos los campos (nombre, siglas, organizador) son obligatorios.');
        }

        const existingTeam = await TeamsRepository.checkExistingTeam(nombre, siglas);
        if (existingTeam.rows.length) {
            throw new Error('El nombre o las siglas ya están en uso');
        }

        const id_equipo = Math.floor(100000 + Math.random() * 900000);
        return (await TeamsRepository.createTeam(id_equipo, nombre, siglas, organizador)).rows[0];
    },

    async updateTeam(idEquipo, nombre_new, siglas_new, userId) {
        if (!idEquipo || !userId) throw new Error('ID del equipo y del usuario son obligatorios.');

        const team = await this.getTeamById(idEquipo);
        if (team.id_creador !== userId) {
            throw new Error('No tienes permisos para modificar este equipo.');
        }

        return (await TeamsRepository.updateTeam(
            idEquipo,
            nombre_new || team.nombre,
            siglas_new || team.siglas
        )).rows[0];
    },

    async registerUserToTeam(idEquipo, userId) {
        if (!idEquipo || !userId) throw new Error('ID del equipo y del usuario son obligatorios.');

        const team = await this.getTeamById(idEquipo);

        if (team.id_creador === userId) {
            throw new Error('Eres el dueño de este equipo, no necesitas registrarte.');
        }

        const userTeam = await TeamsRepository.getUserTeam(userId);
        if (userTeam.rows.length && userTeam.rows[0].equipos_id_equipo) {
            throw new Error('El usuario ya pertenece a un equipo.');
        }

        await TeamsRepository.assignUserToTeam(idEquipo, userId);
        return { message: 'Usuario registrado en el equipo correctamente' };
    },

    async removeUserFromTeam(idEquipo, userId, requesterId) {
        if (!idEquipo || !userId || !requesterId) {
            throw new Error('ID del equipo, del usuario y del solicitante son obligatorios.');
        }

        const team = await this.getTeamById(idEquipo);
        if (!team) throw new Error('Equipo no encontrado.');

        if (!team.id_creador) throw new Error('No se pudo determinar el dueño del equipo.');

        if (parseInt(team.id_creador) !== parseInt(requesterId)) {
            throw new Error('Solo el dueño del equipo puede eliminar miembros.');
        }

        if (parseInt(userId) === parseInt(requesterId)) {
            throw new Error('El dueño del equipo no puede eliminarse a sí mismo.');
        }

        const userTeam = await TeamsRepository.getUserTeam(userId);
        if (!userTeam.rows.length || parseInt(userTeam.rows[0].equipos_id_equipo) !== parseInt(idEquipo)) {
            throw new Error('Este usuario no pertenece a este equipo.');
        }

        await TeamsRepository.removeUserFromTeam(userId);
        return { message: 'Usuario eliminado del equipo correctamente.' };
    },

    async leaveTeam(idEquipo, userId) {
        if (!idEquipo || !userId) throw new Error('ID del equipo y del usuario son obligatorios.');

        const team = await this.getTeamById(idEquipo);
        if (!team) throw new Error('Equipo no encontrado.');

        if (!team.id_creador) throw new Error('No se pudo determinar el dueño del equipo.');

        if (parseInt(team.id_creador) === parseInt(userId)) {
            throw new Error('El dueño del equipo no puede salir del equipo.');
        }

        const userTeam = await TeamsRepository.getUserTeam(userId);
        if (!userTeam.rows.length || parseInt(userTeam.rows[0].equipos_id_equipo) !== parseInt(idEquipo)) {
            throw new Error('No perteneces a este equipo.');
        }

        await TeamsRepository.removeUserFromTeam(userId);
        return { message: 'Has salido del equipo correctamente.' };
    }
};

module.exports = TeamsService;
