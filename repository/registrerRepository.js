const db = require('../config/db');

class registrerRepository {

    async getCountInscriptions(idTorneo,idTipoInscripcion){
        try {
            const result = await db.query('SELECT count(*) FROM inscripciones WHERE torneos_id_torneo = $1  AND tipo_inscripcion = $2', [idTorneo, idTipoInscripcion]);
            return result.rows[0].count;
        } catch (error) {
            console.error("Error al obtener el conteo de inscripciones:", error);
        }
    }
}

module.exports = new registrerRepository();
