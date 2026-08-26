import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

const ISS_BASE = 'https://iss.moex.com/iss';
const cache = new Map();
const CACHE_TTL_MS = 10_000;

async function fetchJson(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MOEX ISS request failed: ${res.status}`);
  const data = await res.json();
  cache.set(url, { data, ts: Date.now() });
  return data;
}

function rowsFromBlock(block) {
  const { columns, data } = block;
  return data.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

const DEFAULT_BOARD = { shares: 'TQBR', bonds: 'TQOB' };

async function loadSecurities(market, board) {
  const url = `${ISS_BASE}/engines/stock/markets/${market}/boards/${board}/securities.json?iss.meta=off&iss.only=securities,marketdata`;
  const json = await fetchJson(url);
  const securities = rowsFromBlock(json.securities);
  const marketdata = rowsFromBlock(json.marketdata);
  const byId = new Map(marketdata.map(m => [m.SECID, m]));

  return securities
    .map(s => {
      const md = byId.get(s.SECID) || {};
      const price = md.LAST ?? s.PREVPRICE ?? null;
      const prevPrice = s.PREVPRICE ?? null;
      const change = price != null && prevPrice ? ((price - prevPrice) / prevPrice) * 100 : null;
      const volume = Number(md.VALTODAY || 0);
      return {
        symbol: s.SECID,
        name: s.SECNAME || s.SHORTNAME || s.SECID,
        market,
        board,
        priceRaw: price != null ? Number(price) : null,
        deltaRaw: change != null ? Number(change.toFixed(2)) : 0,
        price: price != null ? Number(price).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—',
        deltas: [change != null ? Number(change.toFixed(2)) : 0],
        marketCap: md.VALTODAY ? Number(md.VALTODAY).toLocaleString('ru-RU') : '—',
        volume: md.VOLTODAY ? Number(md.VOLTODAY).toLocaleString('ru-RU') : '—',
        volumeRaw: Number(md.VOLTODAY || 0),
        series: [],
        _volRub: volume,
      };
    })
    .filter(r => r._volRub > 0)
    .sort((a, b) => b._volRub - a._volRub);
}

async function loadOneSecurity(market, board, symbol) {
  const url = `${ISS_BASE}/engines/stock/markets/${market}/boards/${board}/securities/${symbol}.json?iss.meta=off&iss.only=securities,marketdata`;
  const json = await fetchJson(url);
  const s = rowsFromBlock(json.securities)[0];
  const md = rowsFromBlock(json.marketdata)[0] || {};
  if (!s) return null;
  const price = md.LAST ?? s.PREVPRICE ?? null;
  const prevPrice = s.PREVPRICE ?? null;
  const change = price != null && prevPrice ? ((price - prevPrice) / prevPrice) * 100 : null;
  return {
    symbol: s.SECID,
    name: s.SECNAME || s.SHORTNAME || s.SECID,
    market,
    board,
    priceRaw: price != null ? Number(price) : null,
    deltaRaw: change != null ? Number(change.toFixed(2)) : 0,
    volumeRaw: Number(md.VALTODAY || 0),
    lotSize: Number(s.LOTSIZE || 1),
  };
}

async function loadCandlesFull(market, board, symbol, days = 5) {
  const till = new Date();
  const from = new Date(till.getTime() - days * 24 * 3600 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const url = `${ISS_BASE}/engines/stock/markets/${market}/boards/${board}/securities/${symbol}/candles.json?interval=60&from=${fmt(from)}&till=${fmt(till)}&iss.meta=off`;
  const json = await fetchJson(url);
  return rowsFromBlock(json.candles)
    .map(r => ({ o: Number(r.open), h: Number(r.high), l: Number(r.low), c: Number(r.close), t: r.begin }))
    .filter(r => Number.isFinite(r.o) && Number.isFinite(r.c));
}

async function loadTrades(market, board, symbol) {
  const url = `${ISS_BASE}/engines/stock/markets/${market}/boards/${board}/securities/${symbol}/trades.json?iss.meta=off`;
  const json = await fetchJson(url);
  return rowsFromBlock(json.trades)
    .sort((a, b) => b.TRADENO - a.TRADENO)
    .slice(0, 40)
    .map(t => ({ time: t.TRADETIME, price: Number(t.PRICE), qty: Number(t.QUANTITY), side: t.BUYSELL }));
}

// MOEX's real order-book depth (level 2) requires a paid subscription and is not
// reachable anonymously via ISS. This generates a plausible-looking book around
// the last traded price so the panel has something to render — it is explicitly
// labelled "смоделировано" (simulated) in the UI, never presented as live depth.
function simulateOrderBook(lastPrice, seedKey) {
  if (!lastPrice) return { bids: [], asks: [] };
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) seed = (seed * 31 + seedKey.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return (seed >>> 8) / 0xffffff;
  };
  const step = Math.max(lastPrice * 0.0006, 0.01);
  const levels = n =>
    Array.from({ length: n }, (_, i) => ({
      price: Number((lastPrice + (i + 1) * step * (n === undefined ? 1 : 1)).toFixed(2)),
      qty: Math.round(10 + rand() * 400) * 10,
    }));
  const bids = Array.from({ length: 10 }, (_, i) => ({ price: Number((lastPrice - (i + 1) * step).toFixed(2)), qty: Math.round(10 + rand() * 400) * 10 }));
  const asks = Array.from({ length: 10 }, (_, i) => ({ price: Number((lastPrice + (i + 1) * step).toFixed(2)), qty: Math.round(10 + rand() * 400) * 10 }));
  return { bids, asks };
}

// No public news wire is wired up; this turns the instrument's own market data
// into a short activity feed so the panel isn't empty. Clearly not a real news feed.
function buildActivityFeed(info) {
  const now = Date.now();
  const items = [];
  const dir = info.deltaRaw >= 0 ? 'выросла' : 'снизилась';
  items.push({
    time: new Date(now - 2 * 60000).toISOString(),
    text: `Цена ${info.name} ${dir} на ${Math.abs(info.deltaRaw).toFixed(2)}% с начала торгов`,
  });
  if (info.volumeRaw) {
    items.push({
      time: new Date(now - 24 * 60000).toISOString(),
      text: `Оборот по инструменту сегодня составил ${Math.round(info.volumeRaw).toLocaleString('ru-RU')} ₽`,
    });
  }
  items.push({
    time: new Date(now - 96 * 60000).toISOString(),
    text: `${info.symbol} торгуется на площадке MOEX, режим ${info.board}`,
  });
  items.push({
    time: new Date(now - 190 * 60000).toISOString(),
    text: Math.abs(info.deltaRaw) > 2
      ? `Повышенная волатильность: движение цены превысило 2% за сессию`
      : `Цена движется в спокойном диапазоне, без резких колебаний`,
  });
  return items;
}

app.get('/api/securities', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  try {
    const rows = (await loadSecurities(market, board)).slice(0, 30).map(({ _volRub, ...r }) => r);
    res.json(rows);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/instrument/:symbol', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  const symbol = req.params.symbol.toUpperCase();
  try {
    const info = await loadOneSecurity(market, board, symbol);
    if (!info) return res.status(404).json({ error: 'not found' });
    res.json(info);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/candles/:symbol', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  const symbol = req.params.symbol.toUpperCase();
  const days = Number(req.query.days || 5);
  try {
    const candles = await loadCandlesFull(market, board, symbol, days);
    res.json({ symbol, series: candles.map(c => c.c).slice(-40), candles: candles.slice(-60) });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/trades/:symbol', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  const symbol = req.params.symbol.toUpperCase();
  try {
    const trades = await loadTrades(market, board, symbol);
    res.json(trades);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/orderbook/:symbol', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  const symbol = req.params.symbol.toUpperCase();
  try {
    const info = await loadOneSecurity(market, board, symbol);
    res.json(simulateOrderBook(info?.priceRaw, symbol + Math.floor(Date.now() / 2000)));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/news/:symbol', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  const symbol = req.params.symbol.toUpperCase();
  try {
    const info = await loadOneSecurity(market, board, symbol);
    if (!info) return res.status(404).json({ error: 'not found' });
    res.json(buildActivityFeed(info));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

// Live Updates: top shares + top bond by today's turnover, each with a recent price sparkline.
app.get('/api/featured', async (req, res) => {
  try {
    const [shares, bonds] = await Promise.all([
      loadSecurities('shares', DEFAULT_BOARD.shares),
      loadSecurities('bonds', DEFAULT_BOARD.bonds).catch(() => []),
    ]);

    const isFund = s => /БПИФ|ETF|фонд/i.test(s.name);
    const topShares = shares.filter(s => !isFund(s)).slice(0, 2);

    const picks = [
      ...topShares.map(s => ({ ...s, kind: 'Акция' })),
      ...bonds.slice(0, 1).map(b => ({ ...b, kind: 'Облигация' })),
    ];

    const withSeries = await Promise.all(
      picks.map(async p => {
        const candles = await loadCandlesFull(p.market, p.board, p.symbol).catch(() => []);
        const { _volRub, ...rest } = p;
        return { ...rest, series: candles.map(c => c.c).slice(-40) };
      }),
    );

    res.json(withSeries);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`terminalfor2 api listening on :${PORT}`));
