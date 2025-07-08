// netlify/functions/createLegendaryChampion.js
const { getDbClient } = require('./db_config');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, type, shardType, date, player } = JSON.parse(event.body);
  const id = Date.now(); // O UUID

  const client = getDbClient();
  try {
    await client.connect();
    const res = await client.query(
      'INSERT INTO legendary_champions (id, name, type, shard_type, date, player_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [id, name, type, shardType, date, player]
    );
    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.rows[0]),
    };
  } catch (error) {
    console.error("Error creating legendary champion:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create legendary champion", details: error.message }),
    };
  } finally {
    await client.end();
  }
};