class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.code === '23505') {
        return res.status(400).json({ error: 'El registro ya existe en la base de datos' });
    }
    if (err.code === '23503') {
        return res.status(400).json({ error: 'El equipo no existe en la base de datos' });
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    
    return res.status(500).json({ error: 'Ocurrió un error inesperado' });
};

module.exports = { ApiError, errorHandler };
