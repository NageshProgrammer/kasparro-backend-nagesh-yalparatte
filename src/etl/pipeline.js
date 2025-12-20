const fetch = require("node-fetch");
const { fetchCoingeckoMarkets, fetchCoinpaprikaTickers } = require("./extract");
const { normalizeCoin } = require("./transform");
const { upsertCoinAndPrice } = require("./load");

const COINGECKO = process.env.COINGECKO_API;
const COINPAPRIKA = process.env.COINPAPRIKA_API;

const runEtlPipeline = async () => {
  const cg = await fetchCoingeckoMarkets(fetch, COINGECKO);
  for (const c of cg) {
    await upsertCoinAndPrice(
      normalizeCoin({
        name: c.name,
        symbol: c.symbol,
        price: c.current_price,
        source: "coingecko",
        sourceId: c.id
      })
    );
  }

  const cp = await fetchCoinpaprikaTickers(fetch, COINPAPRIKA);
  for (const c of cp) {
    await upsertCoinAndPrice(
      normalizeCoin({
        name: c.name,
        symbol: c.symbol,
        price: c.quotes?.USD?.price ?? null,
        source: "coinpaprika",
        sourceId: c.id
      })
    );
  }
};

module.exports = { runEtlPipeline };
