const express = require('express');
require("dotenv").config();
const usuariosRoutes = require('./routes/usuarios');
const torneosRoutes = require('./routes/torneos');
const registroRoutes = require('./routes/registro');
const teamsRoutes = require('./routes/teams');
const { errorHandler } = require('./utils/errorHandler'); 

const app = express();
const port = 3000;


app.use(express.json());

// Usar rutas
app.use('/usuarios', usuariosRoutes);
app.use('/torneos', torneosRoutes);
app.use('/registro', registroRoutes);
app.use('/teams', teamsRoutes);
app.use(errorHandler); 



app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
const gracefulShutdown = () => {
    console.log('🛑 Apagando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente.');
        process.exit(0);
    });
};

process.on('SIGINT', gracefulShutdown); // Captura Ctrl + C
process.on('SIGTERM', gracefulShutdown); 