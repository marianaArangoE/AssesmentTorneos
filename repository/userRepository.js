const db = require('../config/db');

class UsuarioRepository {
    async createUsuario({ id_usuario, nombre, correo, contrasena, apodo, equipos_id_equipo }) {
        return db.query(
            'INSERT INTO usuarios (id_usuario, nombre, correo, contrasena, apodo, equipos_id_equipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id_usuario, nombre, correo, contrasena, apodo, equipos_id_equipo]
        );
    }

    async findByCorreo(correo) {
        const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        return result.rowCount ? result.rows[0] : null;
    }

    async findById(id_usuario) {
        const result = await db.query('SELECT id_usuario, nombre, correo, apodo, equipos_id_equipo FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        return result.rowCount ? result.rows[0] : null;
    }
}

module.exports = new UsuarioRepository();
