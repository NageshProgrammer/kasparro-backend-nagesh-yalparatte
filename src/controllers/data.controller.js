// src/controllers/data.controller.js
const { pool } = require("../config/db");
const { runEtlOnce } = require("../../scripts/etl_core");

const listPrices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        c.name AS coin_name,
        c.symbol AS coin_symbol,
        p.source,
        p.price,
        p.fetched_at
      FROM prices p
      JOIN coins c ON c.id = p.coin_id
      ORDER BY p.fetched_at DESC
      LIMIT 200;
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error("❌ listPrices error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

const triggerEtl = async (req, res) => {
  try {
    await runEtlOnce();
    res.json({ message: "ETL pipeline executed successfully" });
  } catch (err) {
    console.error("❌ ETL run error:", err);
    res.status(500).json({ error: "Failed to run ETL pipeline" });
  }
};

module.exports = { listPrices, triggerEtl };
