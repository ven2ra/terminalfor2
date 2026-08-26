import React from 'react';
import { CoinMark } from './CoinMark.jsx';
import { DeltaChip } from '../core/DeltaChip.jsx';
import { Sparkline } from './Sparkline.jsx';
import { Icon } from '../core/Icon.jsx';
/** Dense market ledger. Columns: rank, coin, price, three deltas, market cap, volume, chart. */
export function MarketTable({ rows = [], deltaLabels = ['1H %', '24H %', '7D %'], style, ...rest }) {
  const th = { font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)', fontWeight: 'var(--fw-medium)', textAlign: 'left', padding: '0 var(--sp-6) var(--sp-6)', whiteSpace: 'nowrap' };
  const td = { padding: 'var(--sp-5) var(--sp-6)', borderTop: '1px solid var(--border-hairline)', whiteSpace: 'nowrap' };
  const sortable = label => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{label}<Icon name="chevrons-up-down" size={11} style={{ background: 'var(--n-500)' }} /></span>
  );
  return (
    <table {...rest} style={{ width: '100%', borderCollapse: 'collapse', ...style }}>
      <thead><tr>
        <th style={th}>No</th><th style={th}>{sortable('Coin name')}</th><th style={{ ...th, textAlign: 'right' }}>{sortable('Price')}</th>
        {deltaLabels.map(l => <th key={l} style={{ ...th, textAlign: 'center' }}>{l}</th>)}
        <th style={{ ...th, textAlign: 'right' }}>{sortable('Market Cap')}</th>
        <th style={{ ...th, textAlign: 'right' }}>{sortable('Volume (7D)')}</th>
        <th style={{ ...th, textAlign: 'right' }}>Chart</th>
      </tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.symbol + i} style={{ transition: 'var(--t-hover)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <td style={{ ...td, font: 'var(--type-numeric)', color: 'var(--text-faint)' }}>#{i + 1}</td>
            <td style={td}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                <CoinMark symbol={r.symbol} size={22} />
                <span style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{r.name}</span>
                <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>{r.symbol.toUpperCase()}</span>
              </span>
            </td>
            <td style={{ ...td, textAlign: 'right', font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{r.price}</td>
            {(r.deltas || []).map((d, j) => <td key={j} style={{ ...td, textAlign: 'center' }}><DeltaChip value={d} size="sm" /></td>)}
            <td style={{ ...td, textAlign: 'right', font: 'var(--type-numeric)', color: 'var(--text-faint)', letterSpacing: 'var(--ls-ticker)' }}>{r.marketCap}</td>
            <td style={{ ...td, textAlign: 'right', font: 'var(--type-numeric-strong)', color: 'var(--text-primary)' }}>{r.volume}</td>
            <td style={{ ...td, width: 110 }}><Sparkline points={r.series || []} tone={(r.deltas && r.deltas[1] >= 0) ? 'up' : 'down'} height={30} width={100} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
