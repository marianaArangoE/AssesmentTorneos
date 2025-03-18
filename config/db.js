const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
    console.error("❌ Error: La variable de entorno DATABASE_URL no está definida.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Manejo de errores en la conexión
pool.on("error", (err) => {
    console.error("❌ Error en la conexión de la base de datos:", err);
});

// ✅ Función reutilizable para ejecutar queries
const query = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        console.error("❌ Error ejecutando query:", error);
        throw error;
    }
};

// ✅ Cerrar la conexión cuando el servidor se apaga
const closeDbConnection = async () => {
    await pool.end();
    console.log("🔌 Conexión cerrada correctamente");
};

// Manejo de cierre al apagar el servidor
process.on("SIGINT", async () => {
    console.log("🛑 Apagando el servidor...");
    await closeDbConnection();
    process.exit(0);
});

module.exports = { query, closeDbConnection };
