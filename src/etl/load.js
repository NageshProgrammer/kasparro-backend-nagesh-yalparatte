const { pool } = require("../config/db");

const upsertCoinAndPrice = async ({ name, symbol, price, source, sourceId }) => {
  const coinRes = await pool.query(
    `
    INSERT INTO coins (name, symbol, ${source}_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (LOWER(name), LOWER(symbol))
    DO UPDATE SET ${source}_id = COALESCE(coins.${source}_id, EXCLUDED.${source}_id)
    RETURNING id
    `,
    [name, symbol, sourceId]
  );

  const coinId = coinRes.rows[0].id;

  await pool.query(
    `
    INSERT INTO prices (coin_id, source, price, fetched_at)
    VALUES ($1, $2, $3, NOW())
    `,
    [coinId, source, price]
  );
};

module.exports = { upsertCoinAndPrice };
