const UsuarioService = require('../services/userServices');

const usuariosController = {
    createUsuario: async (req, res) => {
        try {
            const usuario = await UsuarioService.createUsuario(req.body);
            res.status(201).json({ message: 'Usuario creado', usuario });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { token } = await UsuarioService.login(req.body);
            res.json({ message: 'Inicio de sesión exitoso', token });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    getUsuario: async (req, res) => {
        try {
            const usuario = await UsuarioService.getUsuario(req.user.id_usuario);
            res.json({ usuario });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
};

module.exports = usuariosController;
