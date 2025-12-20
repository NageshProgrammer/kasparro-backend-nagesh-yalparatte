const normalizeCoin = ({ name, symbol, price, source, sourceId }) => {
  return {
    name: name.toLowerCase(),
    symbol: symbol.toLowerCase(),
    price,
    source,
    sourceId
  };
};

module.exports = { normalizeCoin };
