import React from 'react';
import { CoinMark } from './CoinMark.jsx';
/** Full-bleed price ribbon under the topbar. */
export function TickerStrip({ items = [], style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-14)', height: 'var(--ticker-h)',
      padding: '0 var(--sp-9)', overflow: 'hidden', background: 'var(--bg-app)',
      borderBlock: '1px solid var(--border-hairline)', ...style }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-4)', whiteSpace: 'nowrap' }}>
          <span style={{ font: 'var(--type-numeric-strong)', color: 'var(--text-body)' }}>{it.price}</span>
          <CoinMark symbol={it.symbol} size={14} />
          <span style={{ font: 'var(--type-label)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{it.symbol.toUpperCase()}</span>
          <span style={{ font: 'var(--type-label)', color: 'var(--text-faint)' }}>/{it.quote || 'USDT'}</span>
        </span>
      ))}
    </div>
  );
}
