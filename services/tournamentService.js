const TournamentRepository = require('../repository/tournamentRepository');

const { ApiError } = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');

class tournamentService {
    async getTournaments(viewAll, order) {
        if (!viewAll || !order) {
            throw new ApiError(400, 'Los campos no pueden ser vacíos');
        }

        const validOrders = ['ASC', 'DESC'];
        if (!validOrders.includes(order.toUpperCase())) {
            throw new ApiError(400, 'Orden inválido, usa ASC o DESC');
        }

        return viewAll === 'true'
            ? TournamentRepository.getAllTournaments(order)
            : TournamentRepository.getActiveTournaments(order);
    }

    async getTournamentById(idTorneo) {
        const tournament = await TournamentRepository.getTournamentById(idTorneo);
        if (!tournament) {
            throw new ApiError(404, 'Torneo no encontrado');
        }
        return tournament;
    }

    async getTournamentsByGame(nombreJuego) {
        if (!nombreJuego) {
            throw new ApiError(400, 'El nombre del juego es obligatorio');
        }

        const result = await TournamentRepository.getTournamentsByGame(nombreJuego);
        if (result.rows.length === 0) {
            throw new ApiError(404, 'No se encontraron torneos para este juego');
        }

        return result.rows;
    }

    async createTournament(data, token) {
        if (!token || !token.startsWith('Bearer ')) {
            throw new ApiError(401, 'Token no proporcionado o formato inválido');
        }
    
        const organizador = jwt.decode(token.split(' ')[1]).id_usuario;
        const id_torneo = Math.floor(Math.random() * 1000000);
        
        
        const { nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free, limite_equipos, limite_views, plataforma_id, categorias_id, descripcion } = data;
    
        if (!nombre || !fecha_inicio || !fecha_fin || !video_juegos_id || !its_free || !limite_equipos || !limite_views || !plataforma_id || !categorias_id || !descripcion) {
            throw new ApiError(400, 'Todos los campos son obligatorios');
        }
    
        if (fecha_inicio > fecha_fin) {
            throw new ApiError(400, 'La fecha de inicio no puede ser mayor a la fecha de fin');
        }
    
        if (limite_equipos % 2 !== 0) {
            throw new ApiError(400, 'La cantidad de equipos debe ser un número par');
        }
    
        if (limite_views < 0) {
            throw new ApiError(400, 'El límite de views no puede ser negativo');
        }
        
        const limitedFreeTournamentCount = await TournamentRepository.getLimitedFreeTournamentsByOrganizer(organizador);
        if (its_free.toUpperCase() === 'T' && limite_views === 20 && limitedFreeTournamentCount >= 2) {
            throw new ApiError(403, 'No puedes crear más de 2 torneos gratuitos con aforo de 20 views.');
        }
        return TournamentRepository.createTournament({
            id_torneo,
            nombre,
            fecha_inicio,
            fecha_fin,
            video_juegos_id,
            its_free: its_free.toUpperCase(),
            limite_equipos,
            limite_views,
            plataforma_id,
            categorias_id,
            descripcion,
            organizador
        });
    }
    
    async updateTournament(idTorneo, data, token) {
        if (!token || !token.startsWith('Bearer ')) {
            throw new ApiError(401, 'Token no proporcionado o formato inválido');
        }
    
        const tournament = await TournamentRepository.getTournamentById(idTorneo);
        if (!tournament) {
            throw new ApiError(404, 'Torneo no encontrado');
        }
    
        const userId = jwt.decode(token.split(' ')[1]).id_usuario;
        if (tournament.organizador !== userId) {
            throw new ApiError(403, 'No tienes permisos para actualizar este torneo');
        }
    
        
        const updatedTournament = {
            nombre: data.nombre || tournament.nombre,
            fecha_inicio: data.fecha_inicio || tournament.fecha_inicio,
            fecha_fin: data.fecha_fin || tournament.fecha_fin,
            descripcion: data.descripcion || tournament.descripcion
        };
    
        return TournamentRepository.updateTournament(idTorneo, updatedTournament);
    }
}

module.exports = new tournamentService();
