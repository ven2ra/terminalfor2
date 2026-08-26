import React from 'react';

// A local, per-browser demo trading account. No real orders ever reach any
// exchange — this only exists so the "buy/sell" UI has something honest to
// act on (real balance/position/P&L arithmetic over simulated fills),
// instead of a button that does nothing.

const KEY = 'tf2_demo_account_v2';
const COMMISSION_RATE = 0.0005; // 0.05% — a representative retail rate, not a real broker's

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

function applyFill(s, { symbol, market, board, name, side, qty, price, type }) {
  const commission = qty * price * COMMISSION_RATE;
  const signedQty = side === 'Купить' ? qty : -qty;
  const pos = s.positions[symbol] || { qty: 0, avgPrice: 0, market, board, name };
  let nextPos;
  if (side === 'Купить') {
    const newQty = pos.qty + qty;
    const newAvg = pos.qty > 0 ? (pos.qty * pos.avgPrice + qty * price) / newQty : price;
    nextPos = { ...pos, qty: newQty, avgPrice: newAvg, market, board, name };
  } else {
    const newQty = Math.max(0, pos.qty - qty);
    nextPos = { ...pos, qty: newQty, avgPrice: newQty > 0 ? pos.avgPrice : 0, market, board, name };
  }
  const cashDelta = side === 'Купить' ? -(qty * price + commission) : qty * price - commission;
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

/** Places an order. Market fills immediately; Limit/Stop-* queue until checkPendingOrders triggers them. */
export function placeOrder({ symbol, market, board, name, side, type, qty, price, stopPrice, lastPrice }) {
  qty = Math.max(1, Math.floor(qty) || 0);
  const s = state;

  // Demo guardrails: can't sell more than you hold, can't spend more cash than you have.
  if (side === 'Продать') {
    const held = s.positions[symbol]?.qty || 0;
    qty = Math.min(qty, held);
    if (qty <= 0) return { ok: false, error: 'Нет позиции для продажи' };
  } else if (type === 'Рыночная' || type === 'Лимитная') {
    const refPrice = type === 'Рыночная' ? lastPrice : price;
    const cost = qty * refPrice * (1 + COMMISSION_RATE);
    if (cost > s.cash) return { ok: false, error: 'Недостаточно средств' };
  }

  if (type === 'Рыночная') {
    set(applyFill(state, { symbol, market, board, name, side, qty, price: lastPrice, type }));
    return { ok: true, filled: true };
  }

  const order = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    symbol, market, board, name, side, type, qty,
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

    if (trigger) {
      s = applyFill(s, { symbol: o.symbol, market: o.market, board: o.board, name: o.name, side: o.side, qty: o.qty, price: fillPrice, type: o.type });
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
