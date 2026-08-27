import express from 'express';
import * as tinkoff from './tinkoff.js';
import { isMarketOpen } from './marketHours.js';

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

// The Bank of Russia's key rate ("ключевая ставка"), straight from its own
// SOAP web service — it changes only a handful of times a year (rate-setting
// meetings), so a long cache is deliberate, not laziness.
const CBR_SOAP_URL = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx';
const KEY_RATE_TTL_MS = 6 * 3600_000;
let keyRateCache = { value: null, ts: 0 };

async function loadKeyRate() {
  if (keyRateCache.value != null && Date.now() - keyRateCache.ts < KEY_RATE_TTL_MS) {
    return keyRateCache.value;
  }
  const to = new Date();
  const from = new Date(to.getTime() - 30 * 24 * 3600 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <KeyRate xmlns="http://web.cbr.ru/">
      <fromDate>${fmt(from)}</fromDate>
      <ToDate>${fmt(to)}</ToDate>
    </KeyRate>
  </soap12:Body>
</soap12:Envelope>`;
  const res = await fetch(CBR_SOAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: '"http://web.cbr.ru/KeyRate"' },
    body,
  });
  if (!res.ok) throw new Error(`CBR key rate request failed: ${res.status}`);
  const xml = await res.text();
  // The service returns entries newest-first, so the first <Rate> in the
  // document is the currently effective key rate.
  const match = xml.match(/<Rate>([\d.,]+)<\/Rate>/);
  if (!match) throw new Error('CBR key rate: unexpected response shape');
  const rate = Number(match[1].replace(',', '.'));
  keyRateCache = { value: rate, ts: Date.now() };
  return rate;
}

function rowsFromBlock(block) {
  const { columns, data } = block;
  return data.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

const DEFAULT_BOARD = { shares: 'TQBR', bonds: 'TQOB' };

// MOEX's own market split is coarser than "shares vs bonds": equity ETFs/BPIFs
// (INSTRID=IFTF) trade on the *shares* market/board right alongside common
// stock, and so do BPIFs that actually hold bonds — MOEX doesn't expose a
// separate machine-readable "this fund invests in bonds" flag, so that one
// distinction falls back to matching the fund's own name (every bond BPIF on
// MOEX spells out "облигации" or "обл" in its name; a false negative here
// would just leave a bond fund classified as an equity fund, not a bond).
function classifyKind(market, secname, instrid) {
  if (market === 'bonds') return 'bond';
  const isFund = instrid === 'IFTF' || /БПИФ|ETF|фонд/i.test(secname || '');
  if (!isFund) return 'share';
  return /облига|обл\.|bond/i.test(secname || '') ? 'bond-fund' : 'equity-fund';
}

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
      const name = s.SECNAME || s.SHORTNAME || s.SECID;
      return {
        symbol: s.SECID,
        name,
        market,
        board,
        kind: classifyKind(market, name, s.INSTRID),
        lotSize: Number(s.LOTSIZE || 1),
        minStep: s.MINSTEP != null ? Number(s.MINSTEP) : null,
        faceValue: s.FACEVALUE != null ? Number(s.FACEVALUE) : null,
        accruedInterest: s.ACCRUEDINT != null ? Number(s.ACCRUEDINT) : 0,
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
  const open = md.OPEN ?? null;
  const changeFromOpen = price != null && open ? ((price - open) / open) * 100 : null;
  const name = s.SECNAME || s.SHORTNAME || s.SECID;
  return {
    symbol: s.SECID,
    name,
    market,
    board,
    kind: classifyKind(market, name, s.INSTRID),
    priceRaw: price != null ? Number(price) : null,
    deltaRaw: change != null ? Number(change.toFixed(2)) : 0,
    volumeRaw: Number(md.VALTODAY || 0),
    lotSize: Number(s.LOTSIZE || 1),
    minStep: s.MINSTEP != null ? Number(s.MINSTEP) : null,
    faceValue: s.FACEVALUE != null ? Number(s.FACEVALUE) : null,
    accruedInterest: s.ACCRUEDINT != null ? Number(s.ACCRUEDINT) : 0,
    bid: md.BID != null ? Number(md.BID) : null,
    offer: md.OFFER != null ? Number(md.OFFER) : null,
    spread: md.SPREAD != null ? Number(md.SPREAD) : null,
    dayOpen: open != null ? Number(open) : null,
    dayLow: md.LOW != null ? Number(md.LOW) : null,
    dayHigh: md.HIGH != null ? Number(md.HIGH) : null,
    turnoverToday: Number(md.VALTODAY || 0),
    volumeToday: Number(md.VOLTODAY || 0),
    changeFromOpen: changeFromOpen != null ? Number(changeFromOpen.toFixed(2)) : null,
  };
}

const ISS_PAGE_SIZE = 500;

// MOEX ISS caps candles.json at 500 rows per request and, when the requested
// from/till window holds more than that, silently returns the OLDEST 500 —
// not the most recent. For fine intervals (1m/10m) over a multi-day window
// that meant the "recent" chart was actually stuck hours or days in the
// past. Page through with `start` until a short page (or a row cap) ends it.
async function loadCandlesFull(market, board, symbol, days = 5, interval = 60, till = new Date()) {
  const from = new Date(till.getTime() - days * 24 * 3600 * 1000);
  const fmt = d => d.toISOString().slice(0, 10);
  const base = `${ISS_BASE}/engines/stock/markets/${market}/boards/${board}/securities/${symbol}/candles.json?interval=${interval}&from=${fmt(from)}&till=${fmt(till)}&iss.meta=off`;

  const all = [];
  for (let page = 0; page < 40; page++) {
    const url = page === 0 ? base : `${base}&start=${page * ISS_PAGE_SIZE}`;
    const json = await fetchJson(url);
    const rows = json.candles?.data || [];
    all.push(...rows);
    if (rows.length < ISS_PAGE_SIZE) break;
  }

  return rowsFromBlock({ columns: ['open', 'close', 'high', 'low', 'value', 'volume', 'begin', 'end'], data: all })
    .map(r => ({ o: Number(r.open), h: Number(r.high), l: Number(r.low), c: Number(r.close), t: r.begin }))
    .filter(r => Number.isFinite(r.o) && Number.isFinite(r.c))
    .sort((a, b) => a.t.localeCompare(b.t));
}

// MOEX ISS only serves a handful of native candle intervals (in minutes: 1, 10,
// 60, plus 24=day, 7=week). Timeframes outside that set (5m, 15m, 30m, 4h) are
// built by grouping the nearest native interval's candles into wider buckets.
const TIMEFRAMES = {
  '1m': { interval: 1, days: 1, group: 1 },
  '5m': { interval: 1, days: 2, group: 5 },
  '10m': { interval: 10, days: 5, group: 1 },
  '15m': { interval: 1, days: 3, group: 15 },
  '30m': { interval: 10, days: 10, group: 3 },
  '1h': { interval: 60, days: 10, group: 1 },
  '4h': { interval: 60, days: 40, group: 4 },
  '1d': { interval: 24, days: 400, group: 1 },
  '1w': { interval: 7, days: 1500, group: 1 },
};

function aggregateCandles(candles, groupSize) {
  if (!groupSize || groupSize <= 1) return candles;
  const out = [];
  for (let i = 0; i < candles.length; i += groupSize) {
    const chunk = candles.slice(i, i + groupSize);
    if (!chunk.length) continue;
    out.push({
      o: chunk[0].o,
      c: chunk[chunk.length - 1].c,
      h: Math.max(...chunk.map(c => c.h)),
      l: Math.min(...chunk.map(c => c.l)),
      t: chunk[0].t,
    });
  }
  return out;
}

async function loadTrades(market, board, symbol) {
  // Without `reversed=1` MOEX ISS pages from the START of the trading day —
  // on an active ticker that's tens of thousands of trades behind "now", so
  // the tape looked badly stale. Reversed order puts the newest trades first.
  const url = `${ISS_BASE}/engines/stock/markets/${market}/boards/${board}/securities/${symbol}/trades.json?iss.meta=off&reversed=1`;
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
function simulateOrderBook(lastPrice, seedKey, depth = 20) {
  if (!lastPrice) return { bids: [], asks: [] };
  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) seed = (seed * 31 + seedKey.charCodeAt(i)) >>> 0;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return (seed >>> 8) / 0xffffff;
  };
  const step = Math.max(lastPrice * 0.0006, 0.01);
  const bids = Array.from({ length: depth }, (_, i) => ({ price: Number((lastPrice - (i + 1) * step).toFixed(2)), qty: Math.round(10 + rand() * 400) * 10 }));
  const asks = Array.from({ length: depth }, (_, i) => ({ price: Number((lastPrice + (i + 1) * step).toFixed(2)), qty: Math.round(10 + rand() * 400) * 10 }));
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

// Coupon and offer (put/call) schedule for a bond, straight from MOEX ISS's
// own reference endpoint — no hand-entered data. `bondization.json` returns
// the security's full history, so this filters down to only what's still
// ahead of today and keeps a handful of the nearest of each. For a share
// (or any instrument with no such schedule) both blocks come back empty —
// that's the widget's empty state, not an error.
const BOND_BLOCK_PAGE_SIZE = 20;

// bondization.json pages each block at 20 rows, oldest first, same as
// candles.json's own pagination quirk — a bond with a long enough history
// (semiannual coupons over 10-20+ years) needs more than one page before its
// upcoming (i.e. most recent) entries show up at all.
async function fetchBondBlock(symbol, blockName) {
  const all = [];
  for (let page = 0; page < 20; page++) {
    const url = `${ISS_BASE}/securities/${symbol}/bondization.json?iss.meta=off&iss.only=${blockName}&start=${page * BOND_BLOCK_PAGE_SIZE}`;
    const json = await fetchJson(url);
    const rows = json[blockName] ? rowsFromBlock(json[blockName]) : [];
    all.push(...rows);
    if (rows.length < BOND_BLOCK_PAGE_SIZE) break;
  }
  return all;
}

async function loadBondEvents(symbol) {
  const [couponRows, offerRows] = await Promise.all([
    fetchBondBlock(symbol, 'coupons'),
    fetchBondBlock(symbol, 'offers'),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  const coupons = couponRows
    .filter(c => c.coupondate && c.coupondate >= today)
    .sort((a, b) => a.coupondate.localeCompare(b.coupondate))
    .slice(0, 6)
    .map(c => ({
      date: c.coupondate,
      value: c.value != null ? Number(c.value) : null,
      rate: c.valueprc != null ? Number(c.valueprc) : null,
      faceUnit: c.faceunit || 'RUB',
    }));

  const offers = offerRows
    .filter(o => o.offerdate && o.offerdate >= today)
    .sort((a, b) => a.offerdate.localeCompare(b.offerdate))
    .slice(0, 6)
    .map(o => ({
      date: o.offerdate,
      type: o.offertype || 'Оферта',
      price: o.price != null ? Number(o.price) : null,
      faceUnit: o.faceunit || 'RUB',
    }));

  return { coupons, offers };
}

app.get('/api/bond-events/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  try {
    res.json(await loadBondEvents(symbol));
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/key-rate', async (req, res) => {
  try {
    res.json({ rate: await loadKeyRate() });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/market-status', (req, res) => {
  res.json({ open: isMarketOpen() });
});

// "shares" and "bonds" here name an asset *class* for the instrument list,
// not a raw MOEX market — equity ETFs/BPIFs trade on the shares market and
// belong with shares; BPIFs that hold bonds also trade on the shares market
// but belong with bonds, not mixed in with equities. So the bonds class
// merges the real bonds market with the shares market's bond-fund rows.
app.get('/api/securities', async (req, res) => {
  const assetClass = (req.query.market || 'shares').toString();
  try {
    if (assetClass === 'bonds') {
      const [bonds, shares] = await Promise.all([
        loadSecurities('bonds', DEFAULT_BOARD.bonds),
        loadSecurities('shares', DEFAULT_BOARD.shares),
      ]);
      const rows = [...bonds, ...shares.filter(r => r.kind === 'bond-fund')]
        .sort((a, b) => b._volRub - a._volRub)
        .slice(0, 30)
        .map(({ _volRub, ...r }) => r);
      return res.json(rows);
    }
    const board = (req.query.board || DEFAULT_BOARD.shares).toString().toUpperCase();
    const rows = (await loadSecurities('shares', board))
      .filter(r => r.kind === 'share' || r.kind === 'equity-fund')
      .slice(0, 30)
      .map(({ _volRub, ...r }) => r);
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
  const tf = TIMEFRAMES[req.query.tf] ? req.query.tf.toString() : '1h';
  const cfg = TIMEFRAMES[tf];
  // `before` pages further back in history for the chart's lazy-load-on-scroll —
  // omit it for the normal "recent window" request.
  const before = req.query.before ? new Date(req.query.before.toString().replace(' ', 'T') + 'Z') : new Date();
  try {
    const raw = await loadCandlesFull(market, board, symbol, cfg.days, cfg.interval, before);
    const candles = aggregateCandles(raw, cfg.group);
    const page = req.query.before ? candles : candles.slice(-300);
    res.json({ symbol, tf, series: candles.map(c => c.c).slice(-40), candles: page, hasMore: candles.length > 0 });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
});

app.get('/api/trades/:symbol', async (req, res) => {
  const market = (req.query.market || 'shares').toString();
  const board = (req.query.board || DEFAULT_BOARD[market] || 'TQBR').toString().toUpperCase();
  const symbol = req.params.symbol.toUpperCase();
  try {
    if (tinkoff.isEnabled()) {
      const real = await tinkoff.getLastTrades(board, symbol).catch(e => {
        console.error('T-Invest trades failed, falling back to MOEX ISS:', e.message);
        return null;
      });
      if (real && real.length) return res.json({ trades: real, source: 'tinvest' });
    }
    const trades = await loadTrades(market, board, symbol);
    res.json({ trades, source: 'moex-iss' });
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
    const lotSize = info?.lotSize || 1;
    const withValue = book => ({
      bids: book.bids.map(l => ({ ...l, value: Math.round(l.price * l.qty * lotSize) })),
      asks: book.asks.map(l => ({ ...l, value: Math.round(l.price * l.qty * lotSize) })),
    });

    if (tinkoff.isEnabled()) {
      const real = await tinkoff.getOrderBook(board, symbol, 20).catch(e => {
        console.error('T-Invest order book failed, falling back to simulated:', e.message);
        return null;
      });
      if (real && (real.bids.length || real.asks.length)) {
        return res.json({ ...withValue(real), lotSize, source: 'tinvest' });
      }
    }
    // While the market's closed the book shouldn't visibly wiggle: drop the
    // time component from the seed so repeated polls render the exact same
    // simulated book instead of reshuffling every 2s regardless of whether
    // anything is actually happening.
    const seedKey = isMarketOpen() ? symbol + Math.floor(Date.now() / 2000) : `${symbol}_closed`;
    res.json({ ...withValue(simulateOrderBook(info?.priceRaw, seedKey)), lotSize, source: 'simulated', marketOpen: isMarketOpen() });
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
