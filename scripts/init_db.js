require("dotenv").config();
const { pool } = require("../src/config/db");

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coins (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        coingecko_id TEXT,
        coinpaprika_id TEXT,
        created_at TIMESTAMP DEFAULT now(),
        UNIQUE (LOWER(name), LOWER(symbol))
      );

      CREATE TABLE IF NOT EXISTS prices (
        id SERIAL PRIMARY KEY,
        coin_id INTEGER REFERENCES coins(id) ON DELETE CASCADE,
        source TEXT,
        price NUMERIC,
        fetched_at TIMESTAMP DEFAULT now()
      );
    `);

    console.log("✅ Tables created/verified");
    process.exit(0);
  } catch (err) {
    console.error("❌ DB Init Error", err);
    process.exit(1);
  }
})();
