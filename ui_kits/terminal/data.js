// Fake market data for the Terminalfor UI kit. Figures mirror the source screenshot.
const mk = (seed, n = 24, drift = 1) => {
  const out = []; let v = 50;
  for (let i = 0; i < n; i++) { v += Math.sin((i + seed) / 2.3) * 6 + Math.cos((i + seed) / 5) * 4 + drift * 1.4; out.push(v); }
  return out;
};
window.TF_DATA = {
  tickers: [
    { symbol: 'btc', price: '104,347.43' }, { symbol: 'sol', price: '$176.34' }, { symbol: 'ltc', price: '$0.2329' },
    { symbol: 'doge', price: '$0.22795' }, { symbol: 'matic', price: '$6.54' }, { symbol: 'uni', price: '$6.47' },
    { symbol: 'usdt', price: '$1.00' }, { symbol: 'eth', price: '$2,687.63' },
  ],
  cards: [
    { symbol: 'btc', name: 'Bitcoin', pair: 'BTC/USDT', price: 109687.6, delta: 1.09, series: mk(1, 26, 1) },
    { symbol: 'eth', name: 'Ethereum', pair: 'ETH/USDT', price: 2687.63, delta: -2.01, series: mk(7, 26, -1.2) },
    { symbol: 'sui', name: 'Sui', pair: 'SUI/USDT', price: 178.24, delta: 2.10, series: mk(3, 26, 1.1) },
  ],
  rows: [
    { symbol: 'btc', name: 'Bitcoin', price: '$102,646.00', deltas: [1.24, -0.61, -0.49], marketCap: '$2,090,152,416,300', volume: '$45,328,211,894', series: mk(2, 20, -1) },
    { symbol: 'usdt', name: 'Tether', price: '1.01', deltas: [0.16, 1.28, -0.06], marketCap: '$93,584,210,001', volume: '$35,672,981,002', series: mk(5, 20, 1) },
    { symbol: 'eth', name: 'Ethereum', price: '$3,529.42', deltas: [2.65, -1.16, 4.05], marketCap: '$422,138,947,333', volume: '$21,784,913,118', series: mk(8, 20, 1) },
    { symbol: 'sol', name: 'Solana', price: '$141.75', deltas: [-2.44, 1.06, 4.85], marketCap: '$62,386,574,112', volume: '$6,235,781,332', series: mk(11, 20, -1) },
    { symbol: 'doge', name: 'Doge', price: '$0.166', deltas: [1.05, 1.98, -0.08], marketCap: '$22,418,117,444', volume: '$2,190,432,225', series: mk(13, 20, 1) },
    { symbol: 'sui', name: 'Sui', price: '$1.29', deltas: [-4.03, -2.27, 4.60], marketCap: '$1,873,351,834', volume: '$509,621,122', series: mk(17, 20, -1) },
    { symbol: 'ltc', name: 'Litecoin', price: '$1.29', deltas: [-4.03, 0.63, 4.60], marketCap: '$1,873,351,834', volume: '$509,621,122', series: mk(19, 20, -1) },
  ],
  candles: Array.from({ length: 46 }, (_, i) => {
    const o = 50 + Math.sin(i / 3.1) * 14 + Math.sin(i / 8) * 9;
    const c = o + (i % 3 === 0 ? 7 : -6) + Math.cos(i / 1.7) * 4;
    return { o, c, h: Math.max(o, c) + 3 + (i % 5), l: Math.min(o, c) - 3 - (i % 4) };
  }),
  navGroups: [
    { label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'layout-grid' }] },
    { label: 'Account', items: [
      { id: 'portfolio', label: 'Portfolio', icon: 'candlestick-chart', dot: true },
      { id: 'wallet', label: 'Wallet', icon: 'wallet' },
      { id: 'watchlist', label: 'Watchlist', icon: 'star' } ] },
    { label: 'Activity', items: [
      { id: 'trade', label: 'Trade', icon: 'repeat' },
      { id: 'transactions', label: 'Transactions', icon: 'arrow-left-right' } ] },
    { label: 'Others', items: [
      { id: 'insights', label: 'Insights', icon: 'lightbulb' },
      { id: 'analytics', label: 'Analytics', icon: 'bar-chart-3', badge: 'Beta' },
      { id: 'trends', label: 'Market Trends', icon: 'trending-up' } ] },
    { label: 'Support', items: [
      { id: 'support', label: 'Support', icon: 'life-buoy', badge: '2' },
      { id: 'settings', label: 'Settings', icon: 'settings' } ] },
  ],
  holdings: [
    { symbol: 'btc', name: 'Bitcoin', amount: '0.8241 BTC', value: '$90,412.11', delta: 1.09, alloc: 46 },
    { symbol: 'eth', name: 'Ethereum', amount: '12.44 ETH', value: '$33,434.10', delta: -2.01, alloc: 24 },
    { symbol: 'sol', name: 'Solana', amount: '184.2 SOL', value: '$26,110.35', delta: 4.85, alloc: 17 },
    { symbol: 'usdt', name: 'Tether', amount: '19,240 USDT', value: '$19,240.00', delta: 0.01, alloc: 13 },
  ],
  transactions: [
    { kind: 'Buy', symbol: 'eth', pair: 'ETH/USDT', amount: '4.20 ETH', total: '$11,288.05', time: '15 Jun · 16:09', status: 'Filled' },
    { kind: 'Sell', symbol: 'btc', pair: 'BTC/USDT', amount: '0.0140 BTC', total: '$1,535.62', time: '15 Jun · 14:52', status: 'Filled' },
    { kind: 'Swap', symbol: 'sol', pair: 'SOL/USDT', amount: '52.0 SOL', total: '$7,371.00', time: '14 Jun · 21:04', status: 'Filled' },
    { kind: 'Buy', symbol: 'doge', pair: 'DOGE/USDT', amount: '18,400 DOGE', total: '$3,054.40', time: '14 Jun · 09:31', status: 'Pending' },
    { kind: 'Sell', symbol: 'usdt', pair: 'USDT/USD', amount: '2,000 USDT', total: '$2,000.00', time: '13 Jun · 18:12', status: 'Filled' },
  ],
};
