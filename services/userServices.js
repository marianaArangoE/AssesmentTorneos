const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioRepository = require('../repository/userRepository');
const { ApiError } = require('../utils/errorHandler');

const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

class UsuarioService {
    async createUsuario(data) {
        const { id_usuario, nombre, correo, contrasena, apodo, equipos_id_equipo } = data;

        // Si falta algún campo, devuelve 400 (Bad Request)
        if (!id_usuario || !nombre || !correo || !contrasena) {
            throw new ApiError(400, 'Todos los campos son obligatorios');
        }

        // Verificar si el correo ya existe (409 - Conflict)
        const correoExiste = await UsuarioRepository.findByCorreo(correo);
        if (correoExiste) {
            throw new ApiError(409, 'El correo ya está registrado');
        }

        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        try {
            return await UsuarioRepository.createUsuario({
                id_usuario,
                nombre,
                correo,
                contrasena: hashedPassword,
                apodo,
                equipos_id_equipo
            });
        } catch (error) {
            throw new ApiError(500, `Error al crear el usuario: ${error.message}`);
        }
    }

    async login({ correo, contrasena }) {
        if (!correo || !contrasena) {
            throw new ApiError(400, 'Correo y contraseña son obligatorios');
        }

        const usuario = await UsuarioRepository.findByCorreo(correo);
        if (!usuario) {
            throw new ApiError(404, 'Usuario no encontrado');
        }

        const isMatch = await bcrypt.compare(contrasena, usuario.contrasena.trim());
        if (!isMatch) {
            throw new ApiError(401, 'Contraseña incorrecta');
        }

        const token = jwt.sign({ id_usuario: usuario.id_usuario, correo: usuario.correo }, SECRET_KEY, {
            expiresIn: '1h'
        });

        return { token };
    }

    async getUsuario(userId) {
        const usuario = await UsuarioRepository.findById(userId);
        if (!usuario) {
            throw new ApiError(404, 'Usuario no encontrado');
        }
        return usuario;
    }
}

module.exports = new UsuarioService();
