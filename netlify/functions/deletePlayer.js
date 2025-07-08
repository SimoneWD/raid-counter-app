// netlify/functions/deletePlayer.js
const { getDbClient } = require('./db_config');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { playerId } = JSON.parse(event.body);

  const client = getDbClient();
  try {
    await client.connect();
    const res = await client.query(
      'DELETE FROM players WHERE id = $1 RETURNING *;',
      [playerId]
    );

    if (res.rows.length === 0) {
      return { statusCode: 404, body: 'Player not found' };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Player with ID ${playerId} deleted.` }),
    };
  } catch (error) {
    console.error("Error deleting player:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete player", details: error.message }),
    };
  } finally {
    await client.end();
  }
};