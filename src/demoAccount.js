import React from 'react';
import { isMarketOpen } from './marketHours.js';

// A local, per-browser demo trading account. No real orders ever reach any
// exchange — this only exists so the "buy/sell" UI has something honest to
// act on (real balance/position/P&L arithmetic over simulated fills),
// instead of a button that does nothing.

const KEY = 'tf2_demo_account_v2';
// Not an exchange fee — a stand-in for a broker's own commission, since MOEX
// itself doesn't charge retail traders directly. Surfaced in the UI as a
// demo broker rate, never as "the" official rate.
const COMMISSION_RATE = 0.0005;

// A bond quotes as a % of face value plus accrued coupon interest (НКД), not
// as a per-share ruble price — a share/fund's `price` already *is* the per-unit
// ruble cost. `lotSize` always applies: MOEX quotes/trades in whole lots, not
// individual units, for either kind of instrument.
export function unitCost({ isBond, price, faceValue }) {
  return isBond ? (price / 100) * (faceValue || 0) : price;
}

export function orderNotional({ isBond, price, qty, lotSize, faceValue, accruedInterest }) {
  const units = qty * (lotSize || 1);
  const base = unitCost({ isBond, price, faceValue }) * units;
  const nkd = isBond ? (accruedInterest || 0) * units : 0;
  return base + nkd;
}

const DEFAULT_STATE = {
  cash: 1_000_000,
  positions: {}, // symbol -> { qty, avgPrice, market, board, name }
  orders: [], // pending limit/stop orders: { id, symbol, market, board, side, type, qty, price, stopPrice, createdAt }
  history: [], // filled orders: { id, symbol, side, type, qty, price, commission, at }
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object') return { ...DEFAULT_STATE, ...saved };
  } catch {}
  return { ...DEFAULT_STATE };
}

let state = load();
const listeners = new Set();

function set(next) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach(l => l());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

function applyFill(s, { symbol, market, board, name, side, qty, price, type, lotSize, isBond, faceValue, accruedInterest }) {
  lotSize = lotSize || 1;
  const notional = orderNotional({ isBond, price, qty, lotSize, faceValue, accruedInterest });
  const commission = notional * COMMISSION_RATE;
  const pos = s.positions[symbol] || { qty: 0, avgPrice: 0, market, board, name, lotSize, isBond, faceValue };
  let nextPos;
  if (side === 'Купить') {
    const newQty = pos.qty + qty;
    const newAvg = pos.qty > 0 ? (pos.qty * pos.avgPrice + qty * price) / newQty : price;
    nextPos = { ...pos, qty: newQty, avgPrice: newAvg, market, board, name, lotSize, isBond, faceValue };
  } else {
    const newQty = Math.max(0, pos.qty - qty);
    nextPos = { ...pos, qty: newQty, avgPrice: newQty > 0 ? pos.avgPrice : 0, market, board, name, lotSize, isBond, faceValue };
  }
  const cashDelta = side === 'Купить' ? -(notional + commission) : notional - commission;
  const positions = { ...s.positions };
  if (nextPos.qty > 0) positions[symbol] = nextPos;
  else delete positions[symbol];

  const fill = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, symbol, side, type, qty, price, commission, at: new Date().toISOString() };
  return {
    ...s,
    cash: s.cash + cashDelta,
    positions,
    history: [fill, ...s.history].slice(0, 200),
  };
}

// A simplified price collar: MOEX rejects a limit order priced too far from
// the last trade, to stop a fat-fingered price from resting in the book.
const PRICE_BAND_PCT = 20;

/** Places an order. Market fills immediately; Limit/Stop-* queue until checkPendingOrders triggers them.
 * `lotSize`/`isBond`/`faceValue`/`accruedInterest`/`minStep` all come from the instrument's own MOEX ISS
 * data — pass whatever the caller has fetched, never hardcoded here. */
export function placeOrder({ symbol, market, board, name, side, type, qty, price, stopPrice, lastPrice, lotSize, isBond, faceValue, accruedInterest, minStep }) {
  qty = Math.floor(qty) || 0;
  lotSize = lotSize || 1;
  const s = state;

  // A zero (or negative/non-numeric) quantity is never a valid order — it
  // must be rejected outright, not silently bumped up to 1 lot.
  if (qty <= 0) {
    return { ok: false, error: 'Неверное количество — укажите хотя бы 1 лот' };
  }

  // MOEX only continuously matches during the trading session — a market
  // order has nothing to match against once it's closed. A limit order can
  // still be queued to wait for the next session, same as a real broker.
  if (type === 'Рыночная' && !isMarketOpen()) {
    return { ok: false, error: 'Рынок закрыт — рыночные заявки недоступны вне сессии' };
  }

  const needsPrice = type === 'Лимитная' || type === 'Стоп-лимит';
  if (needsPrice) {
    if (!(price > 0)) {
      return { ok: false, error: 'Неверная цена заявки' };
    }
    if (minStep) {
      const steps = price / minStep;
      if (Math.abs(Math.round(steps) - steps) > 1e-6) {
        return { ok: false, error: 'Неверный шаг цены' };
      }
    }
    if (lastPrice > 0) {
      const band = lastPrice * (PRICE_BAND_PCT / 100);
      if (price < lastPrice - band || price > lastPrice + band) {
        return { ok: false, error: 'Цена вне коридора допустимых значений' };
      }
    }
  }

  // Demo guardrails: can't sell more than you hold, can't spend more cash than you have.
  if (side === 'Продать') {
    const held = s.positions[symbol]?.qty || 0;
    if (held <= 0) return { ok: false, error: 'Нет бумаг для продажи' };
    qty = Math.min(qty, held);
  } else if (type === 'Рыночная' || type === 'Лимитная') {
    const refPrice = type === 'Рыночная' ? lastPrice : price;
    const cost = orderNotional({ isBond, price: refPrice, qty, lotSize, faceValue, accruedInterest }) * (1 + COMMISSION_RATE);
    if (cost > s.cash) return { ok: false, error: 'Недостаточно средств' };
  }

  if (type === 'Рыночная') {
    set(applyFill(state, { symbol, market, board, name, side, qty, price: lastPrice, type, lotSize, isBond, faceValue, accruedInterest }));
    return { ok: true, filled: true };
  }

  const order = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    symbol, market, board, name, side, type, qty, lotSize, isBond, faceValue, accruedInterest,
    price: type === 'Лимитная' || type === 'Стоп-лимит' ? Number(price) : null,
    stopPrice: type === 'Стоп-лимит' || type === 'Стоп-маркет' ? Number(stopPrice) : null,
    createdAt: new Date().toISOString(),
  };
  set({ ...state, orders: [...state.orders, order] });
  return { ok: true, filled: false };
}

export function cancelOrder(id) {
  set({ ...state, orders: state.orders.filter(o => o.id !== id) });
}

/** Called on each fresh price tick for a symbol — fills any pending order whose trigger has been crossed. */
export function checkPendingOrders(symbol, lastPrice) {
  const pending = state.orders.filter(o => o.symbol === symbol);
  if (!pending.length) return;

  let s = state;
  const remaining = [];
  for (const o of s.orders) {
    if (o.symbol !== symbol) {
      remaining.push(o);
      continue;
    }
    const buy = o.side === 'Купить';
    let trigger = false;
    let fillPrice = lastPrice;

    if (o.type === 'Лимитная') {
      trigger = buy ? lastPrice <= o.price : lastPrice >= o.price;
      fillPrice = o.price;
    } else if (o.type === 'Стоп-маркет') {
      trigger = buy ? lastPrice >= o.stopPrice : lastPrice <= o.stopPrice;
      fillPrice = lastPrice;
    } else if (o.type === 'Стоп-лимит') {
      trigger = buy ? lastPrice >= o.stopPrice : lastPrice <= o.stopPrice;
      fillPrice = o.price;
    }

    if (trigger && isMarketOpen()) {
      s = applyFill(s, {
        symbol: o.symbol, market: o.market, board: o.board, name: o.name, side: o.side, qty: o.qty, price: fillPrice, type: o.type,
        lotSize: o.lotSize, isBond: o.isBond, faceValue: o.faceValue, accruedInterest: o.accruedInterest,
      });
    } else {
      remaining.push(o);
    }
  }
  if (remaining.length !== s.orders.length || s !== state) {
    set({ ...s, orders: remaining });
  }
}

export function commissionRate() {
  return COMMISSION_RATE;
}

export function useDemoAccount() {
  return React.useSyncExternalStore(subscribe, getSnapshot);
}
