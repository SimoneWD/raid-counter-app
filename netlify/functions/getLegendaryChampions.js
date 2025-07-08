// netlify/functions/getLegendaryChampions.js
const { getDbClient } = require('./db_config');

exports.handler = async (event, context) => {
  const client = getDbClient();
  try {
    await client.connect();
    const res = await client.query('SELECT id, name, type, shard_type, date, player_id FROM legendary_champions;');
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(res.rows),
    };
  } catch (error) {
    console.error("Error fetching legendary champions:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch legendary champions", details: error.message }),
    };
  } finally {
    await client.end();
  }
};