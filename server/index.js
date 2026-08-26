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
        priceRaw: price != null ? Number(price) : null,
        deltaRaw: change != null ? Number(change.toFixed(2)) : 0,
        price: price != null ? Number(price).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—',
        deltas: [change != null ? Number(change.toFixed(2)) : 0],
        marketCap: md.VALTODAY ? Number(md.VALTODAY).toLocaleString('ru-RU') : '—',
        volume: md.VOLTODAY ? Number(md.VOLTODAY).toLocaleString('ru-RU') : '—',
        series: [],
        _volRub: volume,
      };
    })
    .filter(r => r._volRub > 0)
    .sort((a, b) => b._volRub - a._volRub);
}

async function loadCandles(market, board, symbol) {
  const till = new Date();
  const from = new Date(till.getTime() - 5 * 24 * 3600 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const url = `${ISS_BASE}/engines/stock/markets/${market}/boards/${board}/securities/${symbol}/candles.json?interval=60&from=${fmt(from)}&till=${fmt(till)}&iss.meta=off`;
  const json = await fetchJson(url);
  const rows = rowsFromBlock(json.candles);
  return rows.map(r => Number(r.close)).filter(Number.isFinite).slice(-40);
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

app.get('/api/candles/:symbol', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  const symbol = req.params.symbol.toUpperCase();
  try {
    const series = await loadCandles(market, board, symbol);
    res.json({ symbol, series });
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
      ...topShares.map(s => ({ ...s, market: 'shares', board: DEFAULT_BOARD.shares, kind: 'Акция' })),
      ...bonds.slice(0, 1).map(b => ({ ...b, market: 'bonds', board: DEFAULT_BOARD.bonds, kind: 'Облигация' })),
    ];

    const withSeries = await Promise.all(
      picks.map(async p => {
        const series = await loadCandles(p.market, p.board, p.symbol).catch(() => []);
        const { _volRub, ...rest } = p;
        return { ...rest, series };
      }),
    );

    res.json(withSeries);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`terminalfor2 api listening on :${PORT}`));
