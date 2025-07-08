// netlify/functions/updatePlayerName.js
const { getDbClient } = require('./db_config');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { playerId, newName } = JSON.parse(event.body);

  const client = getDbClient();
  try {
    await client.connect();
    const res = await client.query(
      'UPDATE players SET name = $1 WHERE id = $2 RETURNING *;',
      [newName, playerId]
    );

    if (res.rows.length === 0) {
      return { statusCode: 404, body: 'Player not found' };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.rows[0]), // Ritorna il giocatore aggiornato
    };
  } catch (error) {
    console.error("Error updating player name:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update player name", details: error.message }),
    };
  } finally {
    await client.end();
  }
};