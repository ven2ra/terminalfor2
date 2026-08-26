export async function fetchSecurities(board = 'TQBR') {
  const res = await fetch(`/api/securities?board=${board}`);
  if (!res.ok) throw new Error(`securities request failed: ${res.status}`);
  return res.json();
}

export async function fetchFeatured() {
  const res = await fetch('/api/featured');
  if (!res.ok) throw new Error(`featured request failed: ${res.status}`);
  return res.json();
}

function q(market, board) {
  return `market=${encodeURIComponent(market)}&board=${encodeURIComponent(board)}`;
}

export async function fetchInstrument(symbol, market, board) {
  const res = await fetch(`/api/instrument/${symbol}?${q(market, board)}`);
  if (!res.ok) throw new Error(`instrument request failed: ${res.status}`);
  return res.json();
}

export async function fetchCandles(symbol, market, board, tf = '1h', before) {
  const beforeParam = before ? `&before=${encodeURIComponent(before)}` : '';
  const res = await fetch(`/api/candles/${symbol}?${q(market, board)}&tf=${encodeURIComponent(tf)}${beforeParam}`);
  if (!res.ok) throw new Error(`candles request failed: ${res.status}`);
  return res.json();
}

export async function fetchTrades(symbol, market, board) {
  const res = await fetch(`/api/trades/${symbol}?${q(market, board)}`);
  if (!res.ok) throw new Error(`trades request failed: ${res.status}`);
  return res.json();
}

export async function fetchOrderBook(symbol, market, board) {
  const res = await fetch(`/api/orderbook/${symbol}?${q(market, board)}`);
  if (!res.ok) throw new Error(`orderbook request failed: ${res.status}`);
  return res.json();
}

export async function fetchNews(symbol, market, board) {
  const res = await fetch(`/api/news/${symbol}?${q(market, board)}`);
  if (!res.ok) throw new Error(`news request failed: ${res.status}`);
  return res.json();
}
