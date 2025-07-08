// netlify/functions/updatePlayerShards.js
const { getDbClient } = require('./db_config');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { playerId, shardType, newCount } = JSON.parse(event.body);

  const client = getDbClient();
  try {
    await client.connect();

    const currentPlayerData = await client.query('SELECT shards FROM players WHERE id = $1;', [playerId]);
    if (currentPlayerData.rows.length === 0) {
      return { statusCode: 404, body: 'Player not found' };
    }

    const currentShards = currentPlayerData.rows[0].shards || {};
    const updatedShards = { ...currentShards, [shardType]: newCount };

    const res = await client.query(
      'UPDATE players SET shards = $1 WHERE id = $2 RETURNING *;',
      [JSON.stringify(updatedShards), playerId]
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.rows[0]),
    };
  } catch (error) {
    console.error("Error updating player shards:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update player shards", details: error.message }),
    };
  } finally {
    await client.end();
  }
};