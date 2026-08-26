import React from 'react';

// Dark/light theme, applied as a `data-theme` attribute on <html> so every
// component picks it up for free through the CSS custom-property tokens —
// no per-component theme prop needed except where a value is baked into JS
// (the lightweight-charts options in PriceChart.jsx read this store directly).

const KEY = 'tf2_theme_v1';

function load() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark';
}

let theme = load();
const listeners = new Set();

function apply(t) {
  try {
    document.documentElement.setAttribute('data-theme', t);
  } catch {}
}
apply(theme);

function set(next) {
  theme = next;
  apply(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  listeners.forEach(l => l());
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return theme;
}

export function setTheme(next) {
  set(next === 'light' ? 'light' : 'dark');
}

export function toggleTheme() {
  set(theme === 'dark' ? 'light' : 'dark');
}

export function useTheme() {
  return React.useSyncExternalStore(subscribe, getSnapshot);
}
