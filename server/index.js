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
  const idx = name => columns.indexOf(name);
  return data.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

app.get('/api/securities', async (req, res) => {
  const board = (req.query.board || 'TQBR').toString().toUpperCase();
  try {
    const url = `${ISS_BASE}/engines/stock/markets/shares/boards/${board}/securities.json?iss.meta=off&iss.only=securities,marketdata`;
    const json = await fetchJson(url);
    const securities = rowsFromBlock(json.securities);
    const marketdata = rowsFromBlock(json.marketdata);
    const byId = new Map(marketdata.map(m => [m.SECID, m]));

    const rows = securities
      .map(s => {
        const md = byId.get(s.SECID) || {};
        const price = md.LAST ?? s.PREVPRICE ?? null;
        const prevPrice = s.PREVPRICE ?? null;
        const change = price != null && prevPrice ? ((price - prevPrice) / prevPrice) * 100 : null;
        return {
          symbol: s.SECID,
          name: s.SECNAME || s.SHORTNAME || s.SECID,
          price: price != null ? Number(price).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—',
          deltas: [change != null ? Number(change.toFixed(2)) : 0],
          marketCap: md.VALTODAY ? Number(md.VALTODAY).toLocaleString('ru-RU') : '—',
          volume: md.VOLTODAY ? Number(md.VOLTODAY).toLocaleString('ru-RU') : '—',
          series: [],
          _volRub: Number(md.VALTODAY || 0),
        };
      })
      .filter(r => r._volRub > 0)
      .sort((a, b) => b._volRub - a._volRub)
      .slice(0, 30)
      .map(({ _volRub, ...r }) => r);

    res.json(rows);
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`terminalfor2 api listening on :${PORT}`));
