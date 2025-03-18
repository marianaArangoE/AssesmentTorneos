const swaggerJsDoc = require('swagger-jsdoc');
const serverUrl = process.env.EXTERNAL || 'http://localhost:3000';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Torneos',
            version: '1.0.0',
            description: 'Documentación de la API de Torneos',
        },
        servers: [
            {
                url: serverUrl,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Ruta a tus archivos de rutas
};

const specs = swaggerJsDoc(options);

module.exports = specs;
