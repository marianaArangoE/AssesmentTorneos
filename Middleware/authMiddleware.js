const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado, token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.user = decoded; // Guarda los datos del usuario en `req.user`
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
};

module.exports = authMiddleware;
