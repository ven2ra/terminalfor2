// T-Invest API (Т-Инвестиции) client — used for real level-2 order book depth,
// which MOEX ISS never exposes anonymously. Talks to Tinkoff's public REST
// gateway; the server certificate chains to a Russian government CA that
// isn't in most default trust stores, so NODE_EXTRA_CA_CERTS must point at
// certs/russian_trusted_ca_bundle.pem (wired in the Dockerfile/compose file).

const BASE = 'https://invest-public-api.tinkoff.ru/rest/tinkoff.public.invest.api.contract.v1';
const TOKEN = process.env.TINVEST_TOKEN;

const uidCache = new Map();

export function isEnabled() {
  return Boolean(TOKEN);
}

async function call(service, method, body) {
  const res = await fetch(`${BASE}.${service}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`T-Invest ${method} failed: ${res.status}`);
  return res.json();
}

function quotationToNumber(q) {
  if (!q) return null;
  return Number(q.units || 0) + Number(q.nano || 0) / 1e9;
}

export async function resolveInstrumentUid(classCode, ticker) {
  const key = `${classCode}:${ticker}`;
  if (uidCache.has(key)) return uidCache.get(key);
  const json = await call('InstrumentsService', 'ShareBy', {
    idType: 'INSTRUMENT_ID_TYPE_TICKER',
    classCode,
    id: ticker,
  }).catch(() =>
    call('InstrumentsService', 'BondBy', { idType: 'INSTRUMENT_ID_TYPE_TICKER', classCode, id: ticker }),
  );
  const uid = json?.instrument?.uid || null;
  if (uid) uidCache.set(key, uid);
  return uid;
}

export async function getOrderBook(classCode, ticker, depth = 10) {
  const uid = await resolveInstrumentUid(classCode, ticker);
  if (!uid) return null;
  const json = await call('MarketDataService', 'GetOrderBook', { instrumentId: uid, depth });
  return {
    bids: (json.bids || []).map(l => ({ price: quotationToNumber(l.price), qty: Number(l.quantity) })),
    asks: (json.asks || []).map(l => ({ price: quotationToNumber(l.price), qty: Number(l.quantity) })),
  };
}

// MOEX ISS trades.json anonymously lags real time by ~15 minutes; T-Invest's
// GetLastTrades stays within roughly a couple of minutes of "now".
export async function getLastTrades(classCode, ticker, minutes = 10, limit = 40) {
  const uid = await resolveInstrumentUid(classCode, ticker);
  if (!uid) return null;
  const to = new Date();
  const from = new Date(to.getTime() - minutes * 60000);
  const json = await call('MarketDataService', 'GetLastTrades', {
    instrumentId: uid,
    from: from.toISOString(),
    to: to.toISOString(),
  });
  return (json.trades || [])
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, limit)
    .map(t => ({
      time: new Date(t.time).toLocaleTimeString('ru-RU', { hour12: false, timeZone: 'Europe/Moscow' }),
      price: quotationToNumber(t.price),
      qty: Number(t.quantity),
      side: t.direction === 'TRADE_DIRECTION_BUY' ? 'B' : 'S',
    }));
}
