const fetchCoingeckoMarkets = async (fetchFn, baseUrl) => {
  const url = `${baseUrl}/coins/markets?vs_currency=usd&per_page=50&page=1`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error("CoinGecko fetch failed");
  return res.json();
};

const fetchCoinpaprikaTickers = async (fetchFn, baseUrl) => {
  const url = `${baseUrl}/tickers`;
  const res = await fetchFn(url);
  if (!res.ok) throw new Error("CoinPaprika fetch failed");
  const data = await res.json();
  return data.slice(0, 50);
};

module.exports = { fetchCoingeckoMarkets, fetchCoinpaprikaTickers };
