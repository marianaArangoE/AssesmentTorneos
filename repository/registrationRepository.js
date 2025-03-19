const db = require('../config/db');
const https = require('https');

const RegistrationRepository = {
    async searchRegistration(idTorneo, id_user, tipo_inscripcion) {
        const result = await db.query(
            'SELECT * FROM inscripciones WHERE torneos_id_torneo = $1 AND usuarios_id_usuario = $2 AND tipo_inscripcion = $3',
            [idTorneo, id_user, tipo_inscripcion]
        );
        return result.rows.length > 0;
    },

    async getTournamentById(idTorneo) {
        return db.query('SELECT * FROM TORNEOS WHERE id_torneo = $1', [idTorneo]);
    },

    async getCountInscription(idTorneo, idTipoInscripcion) {
        const result = await db.query(
            'SELECT count(*) FROM inscripciones WHERE torneos_id_torneo = $1 AND tipo_inscripcion = $2',
            [idTorneo, idTipoInscripcion]
        );
        return parseInt(result.rows[0].count, 10);
    },

    async searchIdCosto(label) {
        return db.query(`SELECT * FROM precios WHERE LOWER(descripcion) ILIKE '%${label}%'`);
    },

    async searchLabelCategoryById(id) {
        const result = await db.query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
        return result.rows[0].nombre;
    },

    async getComisionValue(text) {
        return db.query(`SELECT * FROM comisiones WHERE LOWER(descripcion) ILIKE '%${text}%'`);
    },

    async insertRegistration(id_registration, tipo_inscripcion, idTorneo, costo, qrBase64, equipo_id, user_id) {
        return db.query(
            'INSERT INTO inscripciones (id_inscripciones, tipo_inscripcion, torneos_id_torneo, monto, codigo, equipos_id_equipo, usuarios_id_usuario, precios_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);',
            [id_registration, tipo_inscripcion, idTorneo, costo, qrBase64, equipo_id, user_id, 1]
        );
    },

    async getRegistrationById(idRegistro) {
        return db.query('SELECT codigo FROM inscripciones WHERE id_inscripciones = $1', [idRegistro]);
    },

    async conversionDollars(cop, tasaCambio = null) {
        if (!tasaCambio) {
            try {
                tasaCambio = await new Promise((resolve, reject) => {
                    https.get('https://v6.exchangerate-api.com/v6/8b267eec9bcdd150e7a2437b/latest/USD', (res) => {
                        let data = '';

                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        res.on('end', () => {
                            try {
                                const json = JSON.parse(data);
                                resolve(json.conversion_rates.COP);
                            } catch (error) {
                                reject("Error al parsear la tasa de cambio");
                            }
                        });
                    }).on('error', (err) => {
                        reject("Error al obtener la tasa de cambio: " + err.message);
                    });
                });
            } catch (error) {
                console.error("❌ Error al obtener la tasa de cambio:", error);
                return null;
            }
        }

        
        const resultado = Math.round((cop / tasaCambio) * 100);
        return resultado; 
    }
};

module.exports = RegistrationRepository;
