const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { put } = require('../routes/teams');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

const teamsController = {
    getTeams: async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM EQUIPOS');
            res.json({ Equipos: result.rows });
        } catch (err) {
            console.error("Error al obtener los equipos:", err);
            res.status(500).json({ error: 'Error al obtener la lista de los equipos' });
        }
    },

    getEquiposById: async (req, res) => {
        try {
            const { idEquipo } = req.params;
            const result = await db.query('SELECT * FROM EQUIPOS WHERE id_equipo = $1', [idEquipo]);
            if (result.rows.length == 0) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
            res.json(result.rows[0]);
        } catch (error) {
            console.error("Error al obtener equipo:", error);
            res.status(500).json({ error: 'Error al obtener el equipo' });
        }
    },

    postCrearEquipos: async (req, res) => {
        try {
            const { nombre, siglas } = req.body;
    
   
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
    
            if (!decoded || !decoded.id_usuario) {
                return res.status(401).json({ error: 'Token inválido' });
            }
    
            const organizador = decoded.id_usuario; 
    
            const equipoExistente = await db.query(
                'SELECT equipos_id_equipo FROM USUARIOS WHERE id_usuario = $1',
                [organizador]
            );
    
            if (equipoExistente.rows[0]?.equipos_id_equipo) {
                return res.status(400).json({ error: 'El usuario ya pertenece a un equipo' });
            }
    
            if (!nombre || !siglas) {
                return res.status(400).json({ error: "Los campos (nombre, siglas) son obligatorios" });
            }
    

            const checkTeamQuery = await db.query(
                'SELECT * FROM EQUIPOS WHERE nombre = $1 OR siglas = $2',
                [nombre, siglas]
            );
    
            if (checkTeamQuery.rows.length > 0) {
                return res.status(409).json({ error: "El nombre o las siglas ya están en uso" });
            }
    
           
            const id_equipo = Math.floor(100000 + Math.random() * 900000);
    
            
            const result = await db.query(
                'INSERT INTO EQUIPOS (id_equipo, nombre, siglas, id_creador) VALUES ($1, $2, $3, $4) RETURNING *',
                [id_equipo, nombre, siglas, organizador]
            );
    
            
            await db.query(
                'UPDATE USUARIOS SET equipos_id_equipo = $1 WHERE id_usuario = $2',
                [id_equipo, organizador]
            );
    
            res.status(201).json({
                message: 'Equipo creado correctamente',
                equipo: result.rows[0]
            });
    
        } catch (error) {
            console.error("Error al crear equipo:", error);
    
            // Manejo de errores de la base de datos
            if (error.code === '23505') {
                return res.status(409).json({ error: "El ID del equipo ya existe" });
            }
            if (error.code === '22P02') {
                return res.status(400).json({ error: "Formato de datos incorrecto" });
            }
    
            res.status(500).json({ error: 'Error interno al crear el equipo' });
        }
    },
    putUpdateTeam: async (req, res) => {

            try {
    
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
                }
                const token = authHeader.split(' ')[1];
                const decoded = jwt.decode(token);
        
                if (!decoded || !decoded.id_usuario) {
                    return res.status(401).json({ error: 'Token inválido' });
                }
        
                const userId = decoded.id_usuario;
                const { idEquipo } = req.params;
                const { nombre_new, siglas_new } = req.body;
        
            
                const queryGetEquipos = await db.query(
                    'SELECT * FROM EQUIPOS WHERE id_equipo = $1',
                    [idEquipo]
                );
        
                if (queryGetEquipos.rows.length === 0) {
                    return res.status(404).json({ error: 'Equipo no encontrado' });
                }
        
                const equipo = queryGetEquipos.rows[0];
        
                
                if (equipo.id_creador !== userId) {
                    return res.status(403).json({ error: 'No tienes permisos para actualizar este equipo' });
                }
        
  
                const nombreActualizado = nombre_new || equipo.nombre;
                const siglasActualizadas = siglas_new || equipo.siglas;
                
        
     
                const result = await db.query(
                    'UPDATE equipos SET nombre = $1, siglas = $2 WHERE id_equipo = $3 RETURNING *',
                    [nombreActualizado, siglasActualizadas, idEquipo]
                );
        
                if (result.rowCount === 0) {
                    return res.status(404).json({ error: 'No se pudo actualizar el equipo' });
                }
        
                res.json({
                    message: 'Equipo actualizado correctamente',
                    //equipo: result.rows[0]
                });
        
            } catch (err) {
                console.error("Error al actualizar el equipo:", err);
                res.status(500).json({ error: 'Error al actualizar el equipo' });
            }
        
    },
    putRegisterToTeam: async (req, res) => {
        try {

            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
    
            if (!decoded || !decoded.id_usuario) {
                return res.status(401).json({ error: 'Token inválido' });
            }
    
            const userId = decoded.id_usuario;
            const { idEquipo } = req.params;
    
           
            const userQuery = await db.query(
                'SELECT equipos_id_equipo FROM USUARIOS WHERE id_usuario = $1',
                [userId]
            );
    
            if (userQuery.rows[0]?.equipos_id_equipo) {
                return res.status(400).json({ error: 'El usuario ya pertenece a un equipo' });
            }
    
            
            const teamQuery = await db.query(
                'SELECT id_equipo FROM EQUIPOS WHERE id_equipo = $1',
                [idEquipo]
            );
    
            if (teamQuery.rows.length === 0) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
    
            
            const countQuery = await db.query(
                'SELECT COUNT(*) AS count FROM USUARIOS WHERE equipos_id_equipo = $1',
                [idEquipo]
            );
    
            const numIntegrantes = parseInt(countQuery.rows[0].count, 10);
    
            if (numIntegrantes >= 7) {
                return res.status(400).json({ error: 'El equipo ya tiene 7 miembros' });
            }
    
            
            await db.query(
                'UPDATE USUARIOS SET equipos_id_equipo = $1 WHERE id_usuario = $2',
                [idEquipo, userId]
            );
    
            res.json({ message: 'Usuario registrado en el equipo correctamente' });
    
        } catch (error) {
            console.error("Error al registrar usuario en equipo:", error);
            res.status(500).json({ error: 'Error al registrar usuario en el equipo' });
        }
    },
    putRemoveUserFromTeam: async (req, res) => {
        try {
         
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
    
            if (!decoded || !decoded.id_usuario) {
                return res.status(401).json({ error: 'Token inválido' });
            }
    
            const organizerId = decoded.id_usuario;
            const { idEquipo } = req.params;  
            const { id_usuario } = req.body;  
    
            if (!id_usuario) {
                return res.status(400).json({ error: 'Debes proporcionar el id_usuario en el body' });
            }
    
            
            const teamQuery = await db.query(
                'SELECT id_creador FROM EQUIPOS WHERE id_equipo = $1',
                [idEquipo]
            );
    
            if (teamQuery.rows.length === 0) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
    
            const id_creador = teamQuery.rows[0].id_creador;
    
          
            if (parseInt(id_usuario) === parseInt(id_creador)) {
                return res.status(403).json({ error: 'No puedes eliminarte a ti mismo del equipo' });
            }
    
            if (id_creador !== organizerId) {
                return res.status(403).json({ error: 'No tienes permisos para eliminar usuarios de este equipo' });
            }
    
           
            const userQuery = await db.query(
                'SELECT equipos_id_equipo FROM USUARIOS WHERE id_usuario = $1',
                [id_usuario]
            );
    
            if (userQuery.rows.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
    
            const equipoActualDelUsuario = userQuery.rows[0].equipos_id_equipo;
    
            console.log(`Usuario ${id_usuario} pertenece al equipo ${equipoActualDelUsuario}, equipo a eliminar ${idEquipo}`);
    
            if (equipoActualDelUsuario == null) {
                return res.status(400).json({ error: 'El usuario no pertenece a ningún equipo' });
            }
    
            if (parseInt(equipoActualDelUsuario) !== parseInt(idEquipo)) {
                return res.status(400).json({ error: `El usuario no pertenece al equipo ${idEquipo}, pertenece a ${equipoActualDelUsuario}` });
            }
    
            const updateQuery = await db.query(
                'UPDATE USUARIOS SET equipos_id_equipo = NULL WHERE id_usuario = $1 RETURNING *',
                [id_usuario]
            );
    
            if (updateQuery.rowCount === 0) {
                return res.status(500).json({ error: 'No se pudo eliminar al usuario del equipo' });
            }
    
            res.json({ message: `Usuario con ID ${id_usuario} eliminado del equipo correctamente` });
    
        } catch (error) {
            console.error("Error al eliminar usuario del equipo:", error);
            res.status(500).json({ error: 'Error interno al eliminar usuario del equipo' });
        }
    },
    putLeaveTeam: async (req, res) => {
        try {
            
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token no proporcionado o formato inválido' });
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
    
            if (!decoded || !decoded.id_usuario) {
                return res.status(401).json({ error: 'Token inválido' });
            }
    
            const userId = decoded.id_usuario;
            const { idEquipo } = req.params; 
    
            
            const userQuery = await db.query(
                'SELECT equipos_id_equipo FROM USUARIOS WHERE id_usuario = $1',
                [userId]
            );
    
            if (userQuery.rows.length === 0 || userQuery.rows[0].equipos_id_equipo == null) {
                return res.status(400).json({ error: 'No perteneces a ningún equipo' });
            }
    
            if (parseInt(userQuery.rows[0].equipos_id_equipo) !== parseInt(idEquipo)) {
                return res.status(400).json({ error: 'No perteneces a este equipo' });
            }
    
            
            const teamQuery = await db.query(
                'SELECT id_creador FROM EQUIPOS WHERE id_equipo = $1',
                [idEquipo]
            );
    
            if (teamQuery.rows.length === 0) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
    
            if (teamQuery.rows[0].id_creador === userId) {
                return res.status(403).json({ error: 'No puedes salir del equipo si eres el organizador. Transfiere el liderazgo primero' });
            }
    
           
            const updateQuery = await db.query(
                'UPDATE USUARIOS SET equipos_id_equipo = NULL WHERE id_usuario = $1 RETURNING *',
                [userId]
            );
    
            if (updateQuery.rowCount === 0) {
                return res.status(500).json({ error: 'No se pudo salir del equipo' });
            }
    
            res.json({ message: `Has salido del equipo ${idEquipo} correctamente` });
    
        } catch (error) {
            console.error("Error al salir del equipo:", error);
            res.status(500).json({ error: 'Error interno al salir del equipo' });
        }
    }
    
    
    
            
};

module.exports = teamsController;
