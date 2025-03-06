const { Pool } = require('pg');
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario si usas NeonDB o Supabase
    }
});

pool.connect()
    .then(() => console.log('✅ Conectado a PostgreSQL'))
    .catch(err => console.error('❌ Error conectando a PostgreSQL:', err));

module.exports = pool;
