const express = require('express');
require("dotenv").config();
const usuariosRoutes = require('./routes/usuarios');
const torneosRoutes = require('./routes/torneos');
const registroRoutes = require('./routes/registro');
const teamsRoutes = require('./routes/teams');

const app = express();
const port = 3000;


app.use(express.json());

// Usar rutas
app.use('/usuarios', usuariosRoutes);
app.use('/torneos', torneosRoutes);
app.use('/registro', registroRoutes);
app.use('/teams', teamsRoutes);



app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
