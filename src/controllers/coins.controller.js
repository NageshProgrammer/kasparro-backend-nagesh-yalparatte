const { pool } = require('../config/db');
const { runEtlOnce } = require('../../scripts/etl_core');

const listCoins = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coins ORDER BY id DESC LIMIT 200');
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
};

const triggerSync = async (req, res) => {
  try {
    await runEtlOnce();
    res.json({ message: 'ETL started' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ETL failed' });
  }
};

module.exports = { listCoins, triggerSync };
