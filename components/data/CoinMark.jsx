import React from 'react';
const CDN = 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/';
export const COIN_COLOR = { btc: 'var(--coin-btc)', eth: 'var(--coin-eth)', usdt: 'var(--coin-usdt)', sol: 'var(--coin-sol)', doge: 'var(--coin-doge)', ltc: 'var(--coin-ltc)', matic: 'var(--coin-matic)', uni: 'var(--coin-uni)', sui: 'var(--coin-sui)' };
// Tokens the CDN set does not ship — render the monogram directly, no failed request.
const NO_ART = new Set(['sui']);
/** Circular asset mark. Uses the real token logo from the cryptocurrency-icons set. */
export function CoinMark({ symbol, size = 22, ring, style, ...rest }) {
  const s = String(symbol || '').toLowerCase();
  const [failed, setFailed] = React.useState(false);
  const missing = failed || NO_ART.has(s);
  const brand = COIN_COLOR[s] || 'var(--accent)';
  return (
    <span {...rest} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size,
      flex: '0 0 auto', borderRadius: 'var(--r-circle)', background: missing ? brand : 'var(--surface-raised)', overflow: 'hidden',
      boxShadow: ring ? `0 0 0 3px color-mix(in srgb, ${brand} 22%, transparent)` : 'none', ...style }}>
      {missing
        ? <span style={{ font: 'var(--type-label)', fontSize: Math.max(8, Math.round(size * .42)), fontWeight: 'var(--fw-bold)', color: '#0b0d10', letterSpacing: 0 }}>{s.slice(0, 1).toUpperCase()}</span>
        : <img src={`${CDN}${s}.svg`} alt={s.toUpperCase()} width={size} height={size} onError={() => setFailed(true)} style={{ display: 'block' }} />}
    </span>
  );
}
