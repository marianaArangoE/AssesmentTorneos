const TournamentRepository = require('../repository/tournamentRepository');
const { ApiError } = require('../utils/errorHandler');
const TournamentService = {
    async getTournaments(viewAll, order) {
        if (!viewAll || !order) {
            throw new Error('Los campos no pueden ser vacíos');
        }

        const validOrders = ['ASC', 'DESC'];
        if (!validOrders.includes(order.toUpperCase())) {
            throw new Error('Orden inválido, usa ASC o DESC');
        }

        return viewAll === 'true'
            ? (await TournamentRepository.getAllTournaments(order)).rows
            : (await TournamentRepository.getActiveTournaments(order, new Date())).rows;
    },

    async getTournamentById(idTorneo) {
        const result = await TournamentRepository.getTournamentById(idTorneo);
        

        if (!result || !result.rows) {
            throw new Error('Error al obtener datos del torneo');
        }
    

        const rows = result.rows || [];
    

        return rows.length > 0 ? rows[0] : null;
    },

    async getTournamentsByGame(nombreJuego) {
        if (!nombreJuego) throw new Error('El nombre del juego es obligatorio');

        const result = await TournamentRepository.getTournamentsByGame(nombreJuego);
        if (!result.rows.length) throw new Error('No se encontraron torneos para este juego');

        return result.rows;
    },

    async createTournament(data) {
        console.log("Datos recibidos en TournamentService:", data);
    
        const { nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free, limite_equipos, limite_views, plataforma_id, categorias_id, descripcion,organizador } = data;

        if(fecha_inicio < new Date().toISOString().split('T')[0]){
            throw new ApiError(400, 'La fecha de inicio no puede ser menor a la fecha actual'); 
        }

        if (fecha_inicio > fecha_fin) {
            throw new ApiError(400, 'La fecha de inicio no puede ser mayor a la fecha de fin');
        }

        if (limite_equipos % 2 !== 0) {
            throw new ApiError(400, 'La cantidad de equipos debe ser un número par');
        }

        if (limite_views <= 0) {
            throw new ApiError(400, 'El límite de views no puede ser negativo o igual a cero');
        }

        const limitedFreeTournamentCount = await TournamentRepository.getLimitedFreeTournamentsByOrganizer(organizador);
        if (its_free.toUpperCase() === 'T' && limite_views === 20 && limitedFreeTournamentCount >= 2) {
            throw new ApiError(403, 'No puedes crear más de 2 torneos gratuitos con aforo de 20 views.');
        }
        
    
        if (!organizador) {
            throw new Error('No se encontró el organizador en el JWT');
        }
    
        if (!nombre || !fecha_inicio || !fecha_fin || !video_juegos_id || !its_free ||
            !limite_equipos || !limite_views || !plataforma_id || !categorias_id || !descripcion) {
            throw new Error('Todos los campos son obligatorios');
        }
    
 
        if (its_free.toUpperCase() === 'T') {
            const countFreeTournaments = await TournamentRepository.getLimitedFreeTournamentsByOrganizer(organizador);
            if (countFreeTournaments >= 2) {
                throw new Error('No puedes crear más de 2 torneos gratuitos.');
            }
        }

        const existingTournament = await TournamentRepository.getTournamentByExactData(nombre, fecha_inicio, fecha_fin, video_juegos_id, organizador);
        if (existingTournament) {
            throw new Error('Ya existe un torneo con los mismos datos.');
        }
    
        const id_torneo = Math.floor(Math.random() * 1000000);
        await TournamentRepository.createTournament({ 
            id_torneo, nombre, fecha_inicio, fecha_fin, video_juegos_id, 
            its_free: its_free.toUpperCase(), limite_equipos, limite_views, 
            plataforma_id, categorias_id, descripcion, organizador 
        });
    
        return { message: 'Torneo creado correctamente', id_torneo };
    },
async updateTournament(idTorneo, updateData, userId) {
    console.log("🟢 ID del usuario recibido en Service:", userId);
    
    if (!userId) {
        throw new Error("No se pudo autenticar el usuario.");
    }
    const { fecha_inicio, fecha_fin, descripcion } = updateData;
    
    if(fecha_inicio < new Date().toISOString().split('T')[0]){
        throw new ApiError(400, 'La fecha de inicio no puede ser menor a la fecha actual'); 
    }

    if (fecha_inicio > fecha_fin) {
        throw new ApiError(400, 'La fecha de inicio no puede ser mayor a la fecha de fin');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error("No hay datos para actualizar");
    }

    const existingTournament = await TournamentRepository.getTournamentById(idTorneo);
    if (!existingTournament) {
        throw new Error('Torneo no encontrado');
    }

    console.log("🟢 Torneo encontrado:", existingTournament);

    if (existingTournament.organizador !== userId) {
        console.log("🔴 Intento de actualización no autorizado. Organizador:", existingTournament.organizador, "Usuario:", userId);
        throw new Error("No tienes permisos para actualizar este torneo");
    }

    const updatedData = {
        nombre: updateData.nombre ? updateData.nombre.substring(0, 100) : existingTournament.nombre, 
        fecha_inicio: updateData.fecha_inicio || existingTournament.fecha_inicio,
        fecha_fin: updateData.fecha_fin || existingTournament.fecha_fin,
        descripcion: updateData.descripcion ? updateData.descripcion.substring(0, 255) : existingTournament.descripcion
    };

    return await TournamentRepository.updateTournament(idTorneo, updatedData);
}

    
};

module.exports = TournamentService;
