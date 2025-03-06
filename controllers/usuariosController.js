const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';
const authMiddleware = require('../Middleware/authMiddleware');


const usuariosController = {
    createUsuario: async (req, res) => {

        try {
            //const id_usuario = Math.floor(100000 + Math.random() * 900000);

            const { id_usuario,nombre, correo, contrasena, apodo, equipos_id_equipo } = req.body;

            if (!id_usuario || !nombre || !correo || !contrasena) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios' });
            }

            const correoExiste = await usuariosController.existCorreo(correo);
            if (correoExiste) {
                return res.status(400).json({ error: 'El correo ya existe' });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(contrasena, saltRounds);


            const result = await db.query(
                'INSERT INTO usuarios (id_usuario, nombre, correo,contrasena,apodo,equipos_id_equipo) VALUES ($1, $2, $3,$4,$5,$6)',
                [id_usuario, nombre, correo, hashedPassword, apodo, equipos_id_equipo]
            );

            res.status(201).json({ message: 'Usuario creado', usuario: result.rows[0] });

        } catch (error) {
            console.error(error);

            if (error.code == '23505') {
                return res.status(400).json({ error: 'El usuario ya existe' });
            }
            else if (error.code == '23503') {
                return res.status(400).json({ error: 'El equipo no existe' });
            }
            else {
                res.status(500).json({ error: `Error al crear usuario ${error}` });
            }
        }
    },

    login: async (req, res) => {
        try {
            const { correo, contrasena } = req.body;

            if (!correo || !contrasena) {
                return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
            }

            const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

            if (result.rowCount === 0) {
                console.log("Usuario no encontrado");
                return res.status(401).json({ error: 'Usuario no encontrado' });
            }

            const usuario = result.rows[0];

            const isMatch = await bcrypt.compare(contrasena, usuario.contrasena.trim());
            if (!isMatch) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }

            const token = jwt.sign({ id_usuario: usuario.id_usuario, correo: usuario.correo }, SECRET_KEY, {
                expiresIn: '1h' // Token válido por 1 hora
            });

            res.json({ message: 'Inicio de sesión exitoso', token });

        } catch (err) {
            console.error("Error en el login:", err);
            res.status(500).json({ error: 'Error en el login' });
        }
    },

    getUsuario: async (req, res) => {
        try {
            const userId = req.user.id_usuario;

            const result = await db.query('SELECT id_usuario, nombre, correo, apodo, equipos_id_equipo FROM usuarios WHERE id_usuario = $1', [userId]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.json({ usuario: result.rows[0] });

        } catch (err) {
            console.error("Error al obtener usuario:", err);
            res.status(500).json({ error: 'Error al obtener información del usuario' });
        }
    },

    existCorreo: async (correo) => {
        try {
            const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
            if (result.rowCount === 0) {
                return false;
            }
            return true;
        } catch (error) {
            console.error("Error al verificar correo:", error);
            return false;
        }

    }

};

module.exports = usuariosController;
