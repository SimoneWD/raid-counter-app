// netlify/functions/getPlayers.js
const { getDbClient } = require('./db_config'); // Assicurati che il percorso sia corretto

exports.handler = async (event, context) => {
  const client = getDbClient();
  try {
    await client.connect();
    const res = await client.query('SELECT id, name, shards FROM players;');
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error("Error fetching players:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch players", details: error.message }),
    };
  } finally {
    await client.end();
  }
};