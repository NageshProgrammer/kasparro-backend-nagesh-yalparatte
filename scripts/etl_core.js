require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const { parse } = require("csv-parse/sync"); // ✅ sync parser
const { pool } = require("../src/config/db");

const COINGECKO = process.env.COINGECKO_API || "https://api.coingecko.com/api/v3";
const COINPAPRIKA = process.env.COINPAPRIKA_API || "https://api.coinpaprika.com/v1";


async function fetchWithTimeout(url, timeout = 8000) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Fetch timeout")), timeout)
    ),
  ]);
}


async function fetchCoingeckoMarkets() {
  const url = `${COINGECKO}/coins/markets?vs_currency=usd&per_page=50&page=1`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error("CoinGecko API failed");
  return res.json();
}

async function fetchCoinpaprikaTickers() {
  const res = await fetchWithTimeout(`${COINPAPRIKA}/tickers`);
  if (!res.ok) throw new Error("CoinPaprika API failed");
  const data = await res.json();
  return data.slice(0, 50);
}


async function upsertCoinAndPrice(source, meta, price) {
  const name = meta.name;
  const symbol = meta.symbol;
  const cgId = meta.cg_id || null;
  const cpId = meta.cp_id || null;

  const existing = await pool.query(
    `
    SELECT id, coingecko_id, coinpaprika_id
    FROM coins
    WHERE LOWER(name) = LOWER($1)
      AND LOWER(symbol) = LOWER($2)
    LIMIT 1
    `,
    [name, symbol]
  );

  let coinId;

  if (existing.rows.length === 0) {
    const inserted = await pool.query(
      `
      INSERT INTO coins (name, symbol, coingecko_id, coinpaprika_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [name, symbol, cgId, cpId]
    );
    coinId = inserted.rows[0].id;
  } else {
    coinId = existing.rows[0].id;

    await pool.query(
      `
      UPDATE coins
      SET
        coingecko_id = COALESCE(coingecko_id, $1),
        coinpaprika_id = COALESCE(coinpaprika_id, $2)
      WHERE id = $3
      `,
      [cgId, cpId, coinId]
    );
  }

  await pool.query(
    `
    INSERT INTO prices (coin_id, source, price, fetched_at)
    VALUES ($1, $2, $3, now())
    `,
    [coinId, source, price]
  );
}

async function runEtlOnce() {
  console.log("STEP 1: ETL Started");

  const cg = await fetchCoingeckoMarkets();
  for (const c of cg) {
    await upsertCoinAndPrice(
      "coingecko",
      { name: c.name, symbol: c.symbol, cg_id: c.id },
      c.current_price
    );
  }
  console.log("STEP 2: CoinGecko processed:", cg.length);

  const cp = await fetchCoinpaprikaTickers();
  for (const c of cp) {
    await upsertCoinAndPrice(
      "coinpaprika",
      { name: c.name, symbol: c.symbol, cp_id: c.id },
      c.quotes?.USD?.price || null
    );
  }
  console.log("STEP 3: CoinPaprika processed:", cp.length);

  const csvPath = "./data/sample_prices.csv";
  if (fs.existsSync(csvPath)) {
    const raw = fs.readFileSync(csvPath);
    const rows = parse(raw, { columns: true, skip_empty_lines: true });

    for (const r of rows) {
      await upsertCoinAndPrice(
        "csv",
        { name: r.name, symbol: r.symbol },
        Number(r.price)
      );
    }

    console.log("STEP 4: CSV rows processed:", rows.length);
  }

  console.log("STEP 5: ETL Finished Successfully ✔");
}

module.exports = { runEtlOnce };
