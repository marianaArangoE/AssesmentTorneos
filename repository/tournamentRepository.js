const db = require('../config/db');

class tournamentRepository {
    async getAllTournaments(order) {
        return db.query(`SELECT * FROM TORNEOS ORDER BY fecha_fin ${order}`);
    }

    async getActiveTournaments(order) {
        return db.query(`SELECT * FROM TORNEOS WHERE fecha_fin > $1 ORDER BY fecha_fin ${order}`, [new Date()]);
    }

    async getTournamentById(idTorneo) {
        const result = await db.query('SELECT * FROM TORNEOS WHERE id_torneo = $1', [idTorneo]);
    


        return result.rows.length ? result.rows[0] : null;
    }

    async getLimitedFreeTournamentsByOrganizer(organizador) {
        const result = await db.query(
            `SELECT COUNT(*) AS count FROM TORNEOS 
             WHERE organizador = $1 AND its_free = 'T' AND limite_views = 20`,
            [organizador]
        );
        return parseInt(result.rows[0].count, 10);
    }
    
    async createTournament(tournamentData) {
        const { id_torneo, nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free, limite_equipos, limite_views, plataforma_id, categorias_id, descripcion, organizador } = tournamentData;

        return db.query(
            `INSERT INTO TORNEOS (id_torneo, nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free, limite_equipos, limite_views, plataformas_id_plataforma, categorias_id_categoria, descripcion, organizador) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [id_torneo, nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free, limite_equipos, limite_views, plataforma_id, categorias_id, descripcion, organizador]
        );
    }
    async getTournamentByExactData(nombre, fecha_inicio, fecha_fin, video_juegos_id, organizador) {
    const result = await db.query(
        `SELECT * FROM TORNEOS 
         WHERE nombre = $1 AND fecha_inicio = $2 AND fecha_fin = $3 
         AND video_juegos_id = $4 AND organizador = $5`,
        [nombre, fecha_inicio, fecha_fin, video_juegos_id, organizador]
    );

    return result.rows.length ? result.rows[0] : null;
}
    async updateTournament(idTorneo, data) {
        let fieldsToUpdate = [];
        let values = [];
        let index = 1;
    
        for (const [key, value] of Object.entries(data)) {
            if (value !== undefined) {
                fieldsToUpdate.push(`${key} = $${index}`);
                values.push(value);
                index++;
            }
        }
    
        if (fieldsToUpdate.length === 0) {
            throw new Error("No hay campos para actualizar");
        }
    
        const query = `UPDATE TORNEOS SET ${fieldsToUpdate.join(", ")} WHERE id_torneo = $${index}`;
        values.push(idTorneo);
    
        const result = await db.query(query, values);
        return result.rows[0];
    }
    
    async getTournamentsByGame(nameTournament) {
        return db.query('SELECT * FROM TORNEOS WHERE LOWER(nombre) = LOWER($1)', [nameTournament]);
    }

    
}

module.exports = new tournamentRepository();
