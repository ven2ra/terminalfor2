import React from 'react';

// A local, per-browser favorites list (watchlist). Same store shape as
// demoAccount.js: plain module state + useSyncExternalStore, persisted to
// localStorage — nothing here is shared across devices or with a server.

const KEY = 'tf2_favorites_v1';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch {}
  return [];
}

let state = load(); // [{ symbol, market, board, name }]
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

export function isFavorite(symbol) {
  return state.some(f => f.symbol === symbol);
}

export function toggleFavorite({ symbol, market, board, name }) {
  if (isFavorite(symbol)) set(state.filter(f => f.symbol !== symbol));
  else set([...state, { symbol, market: market || 'shares', board: board || 'TQBR', name }]);
}

export function useFavorites() {
  return React.useSyncExternalStore(subscribe, getSnapshot);
}
