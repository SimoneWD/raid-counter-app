// netlify/functions/deleteLegendaryChampion.js
const { getDbClient } = require('./db_config');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { championId } = JSON.parse(event.body);

  const client = getDbClient();
  try {
    await client.connect();
    const res = await client.query(
      'DELETE FROM legendary_champions WHERE id = $1 RETURNING *;',
      [championId]
    );

    if (res.rows.length === 0) {
      return { statusCode: 404, body: 'Champion not found' };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Champion with ID ${championId} deleted.` }),
    };
  } catch (error) {
    console.error("Error deleting legendary champion:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to delete legendary champion", details: error.message }),
    };
  } finally {
    await client.end();
  }
};