// netlify/functions/db_config.js
const { Client } = require('pg');

const getDbClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL, // Variabile d'ambiente impostata da Netlify/Neon
    ssl: {
      rejectUnauthorized: false, // Necessario per molte connessioni SSL a DB esterni
    },
  });
};

module.exports = { getDbClient };