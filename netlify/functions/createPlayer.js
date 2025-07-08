// netlify/functions/createPlayer.js
const { getDbClient } = require('./db_config'); // Assicurati che il percorso sia corretto

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, shards } = JSON.parse(event.body);
  const id = Date.now(); // O usa UUID se preferisci

  const client = getDbClient();
  try {
    await client.connect();
    const res = await client.query(
      'INSERT INTO players (id, name, shards) VALUES ($1, $2, $3) RETURNING *;',
      [id, name, JSON.stringify(shards)]
    );
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.rows[0]), // Ritorna il giocatore creato con l'ID
    };
  } catch (error) {
    console.error("Error creating player:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create player", details: error.message }),
    };
  } finally {
    await client.end();
  }
};