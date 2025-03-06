const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';
const authMiddleware = require('../Middleware/authMiddleware');
const { json } = require('express');


const tournamentController = {
    getTournaments: async (req, res) => {
        try {


            let { ViewAll, Order } = req.query;



            if (!ViewAll || !Order) res.status(400).json({ error: 'Los campos no pueden ser vacios' });


            const validOrders = ['ASC', 'DESC'];
            if (!validOrders.includes(Order.toUpperCase())) {
                return res.status(400).json({ error: 'Orden inválido, usa ASC o DESC' });
            }


            if (ViewAll == 'true') {
                const result = await db.query(`SELECT * FROM TORNEOS ORDER BY fecha_fin ${Order}`);
                res.json({ Torneos: result.rows });
            }
            else if (ViewAll == 'false') {

                let currentDate = new Date();
                const result = await db.query(`SELECT * FROM TORNEOS WHERe fecha_fin > $1 ORDER BY fecha_fin ${Order}`, [currentDate]);
                res.json({ Torneos: result.rows });
            }



        } catch (err) {

            if (err.code == '42601') {
                console.error("Todos los parametros son necesarios", err);
                res.status(400).json({ error: 'Todos los parametros son necesarios' });
            }



            console.error("Error al obtener los torneos:", err);
            res.status(500).json({ error: 'Error al obtener la lista de los torneos' });
        }
    },
    getTournamentById: async (req, res) => {
        try {
            const { idTorneo } = req.params;
            const result = await db.query('SELECT * FROM TORNEOS WHERE id_torneo = $1', [idTorneo]);
            if (result.rows.length == 0) {
                return res.status(404).json({ error: 'Torneo no encontrado' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ error: 'Error al obtener el torneo' });
        }
    },
    getTournamentsByGame: async (req, res) => {
        try {
            const { nombreJuego } = req.params;

            if (!nombreJuego) {
                return res.status(400).json({ error: 'El nombre del juego es obligatorio' });
            }

            const query = `
                SELECT t.* FROM TORNEOS t
                INNER JOIN video_juegos vj ON vj.id = t.video_juegos_id
                WHERE LOWER(vj.nombre) = LOWER($1)
            `;

            const result = await db.query(query, [nombreJuego]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'No se encontraron torneos para este juego' });
            }

            res.json({ Torneos: result.rows });

        } catch (error) {
            console.error("Error al obtener torneos por juego:", error);
            res.status(500).json({ error: 'Error al obtener los torneos por juego' });
        }
    },
    postCreateTournament: async (req, res) => {
        try {
            const { nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free, limite_equipos, limite_viewers, plataforma_id, categorias_id, descripcion } = req.body;

            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
            }
            const token = authHeader.split(' ')[1];

            let organizador = await jwt.decode(token).id_usuario;

            let id_torneo = Math.floor(Math.random() * 1000000);

            if (!nombre || !fecha_inicio || !fecha_fin || !video_juegos_id || !its_free || !limite_equipos || !limite_viewers || !plataforma_id || !categorias_id || !descripcion) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }

            if (fecha_inicio > fecha_fin) return res.status(400).json({ error: `La fecha de inicio ${fecha_inicio} no puede ser mayor a la fecha de fin ${fecha_fin}` });

            if (limite_equipos % 2 != 0) return res.status(400).json({ error: `La cantidad de equipo ${limite_equipos} no es un limite valido, tiene que ser un valor par` });

            if (its_free.toLowerCase() == 't' && limite_viewers > 20) return res.status(400).json({ error: `Para un torneo gratis solo se puede tener 20 views como maximo` });

            if (limite_viewers < 0) return res.status(400).json({ error: `El limite de viewers no puede ser negativo` });

            if (its_free.toLowerCase() != 't' && its_free.toLowerCase() != 'f') return res.status(400).json({ error: `El campo its_free solo puede ser 't' o 'f'` });


            const query = `
                INSERT INTO TORNEOS (nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free, limite_equipos, limite_views, plataformas_id_plataforma, categorias_id_categoria, descripcion,organizador,id_torneo)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;

            const result = await db.query(query, [nombre, fecha_inicio, fecha_fin, video_juegos_id, its_free.toUpperCase(), limite_equipos, limite_viewers, plataforma_id, categorias_id, descripcion, organizador, id_torneo]);

            res.json({ message: 'Torneo creado correctamente' });

        }
        catch (error) {
            console.error("Error al crear torneo:", error);
            res.status(500).json({ error: 'Error al crear el torneo' });
        }
    },
    putUpdateTournament: async (req, res) => {

        try {

            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
            }
            const token = authHeader.split(' ')[1];

            const { idTorneo } = req.params;
            const queryGetTournament = await tournamentController.getTournamentByIdRaw(idTorneo);


            if (queryGetTournament.organizador != jwt.decode(token).id_usuario) return res.status(401).json({ error: 'No tienes permisos para actualizar este torneo' });


            let {
                nombre_new,
                fecha_inicio_new,
                fecha_fin_new,
                descripcion_new
            } = req.body;



            const { nombre, fecha_inicio, fecha_fin, descripcion } = queryGetTournament;


            nombre_new = nombre_new || nombre
            fecha_inicio_new = fecha_inicio_new || fecha_inicio
            fecha_fin_new = fecha_fin_new || fecha_fin
            descripcion_new = descripcion_new || descripcion

            if (fecha_inicio_new > fecha_fin_new) return res.status(400).json({ error: `La fecha de inicio ${fecha_inicio} no puede ser mayor a la fecha de fin ${fecha_fin}` });
            
            const result = await db.query('UPDATE torneos SET nombre = $2, fecha_inicio = $3, fecha_fin = $4 , descripcion = $5 WHERE id_torneo = $1', [idTorneo, nombre_new, fecha_inicio_new, fecha_fin_new, descripcion_new]);

            result.rowCount === 0 ? res.status(404).json({ error: 'Torneo no encontrado' }) : res.json({ message: 'Torneo actualizado correctamente' });

        } catch (err) {
            console.error("Error al actualizar el torneo:", err);
            res.status(500).json({ error: 'Error al actualizar el torneo' });
        }

    },

    getTournamentByIdRaw: async (idTorneo) => {
        try {
            const result = await db.query('SELECT * FROM TORNEOS WHERE id_torneo = $1', [idTorneo]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            console.error("Error al obtener torneo:", error);
            throw new Error('Error al obtener el torneo');
        }
    }
};

module.exports = tournamentController;