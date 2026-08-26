import React from 'react';
import { CoinMark } from './CoinMark.jsx';
import { DeltaChip } from '../core/DeltaChip.jsx';
import { Sparkline } from './Sparkline.jsx';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';

// Movement past this magnitude (in %) gets a tinted row so a scan of the
// table surfaces the day's outliers without reading every delta.
const BIG_MOVE_PCT = 3;

/** Dense market ledger. Columns: rank, coin, price, three deltas, market cap, volume, chart, quick actions. */
export function MarketTable({
  rows = [], deltaLabels = ['1H %', '24H %', '7D %'], rankLabel = 'No', nameLabel = 'Coin name',
  priceLabel = 'Price', marketCapLabel = 'Market Cap', volumeLabel = 'Volume (7D)', chartLabel = 'Chart',
  actionsLabel = '', onRowClick, favoriteSymbols, onToggleFavorite, onOpenOrderBook,
  sortKey, sortDir, onSort, style, ...rest
}) {
  const th = { font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)', fontWeight: 'var(--fw-medium)', textAlign: 'left', padding: '0 var(--sp-6) var(--sp-6)', whiteSpace: 'nowrap' };
  const td = { padding: 'var(--sp-5) var(--sp-6)', borderTop: '1px solid var(--border-hairline)', whiteSpace: 'nowrap' };
  const sortable = (label, key) => (
    <span
      onClick={key && onSort ? () => onSort(key) : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: key && onSort ? 'pointer' : 'default' }}
    >
      {label}
      <Icon
        name={sortKey === key ? (sortDir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down'}
        size={11}
        style={{ background: sortKey === key ? 'var(--text-body)' : 'var(--n-500)' }}
      />
    </span>
  );
  return (
    <table {...rest} style={{ width: '100%', borderCollapse: 'collapse', ...style }}>
      <thead><tr>
        <th style={th}>{rankLabel}</th><th style={th}>{sortable(nameLabel, 'name')}</th><th style={{ ...th, textAlign: 'right' }}>{sortable(priceLabel, 'price')}</th>
        {deltaLabels.map((l, i) => <th key={l} style={{ ...th, textAlign: 'center' }}>{i === 0 ? sortable(l, 'delta') : l}</th>)}
        <th style={{ ...th, textAlign: 'right' }}>{sortable(marketCapLabel, 'marketCap')}</th>
        <th style={{ ...th, textAlign: 'right' }}>{sortable(volumeLabel, 'volume')}</th>
        <th style={{ ...th, textAlign: 'right' }}>{chartLabel}</th>
        <th style={{ ...th, textAlign: 'right' }}>{actionsLabel}</th>
      </tr></thead>
      <tbody>
        {rows.map((r, i) => {
          const bigMove = Math.abs(r.deltaRaw ?? (r.deltas && r.deltas[0]) ?? 0) >= BIG_MOVE_PCT;
          const up = (r.deltaRaw ?? (r.deltas && r.deltas[0]) ?? 0) >= 0;
          const isFav = favoriteSymbols && favoriteSymbols.has(r.symbol);
          const baseBg = bigMove ? (up ? 'var(--positive-soft)' : 'var(--negative-soft)') : 'transparent';
          return (
            <tr key={r.symbol + i} style={{ transition: 'var(--t-hover)', cursor: onRowClick ? 'pointer' : 'default', background: baseBg }}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = baseBg; }}>
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
              <td style={{ ...td, textAlign: 'right' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                  {onToggleFavorite && (
                    <IconButton icon="star" size={26} label={isFav ? 'Убрать из избранного' : 'В избранное'}
                      onClick={e => { e.stopPropagation(); onToggleFavorite(r); }}
                      style={{ color: isFav ? 'var(--warn-500)' : undefined, borderColor: isFav ? 'var(--warn-500)' : undefined }} />
                  )}
                  {onOpenOrderBook && (
                    <IconButton icon="layout-list" size={26} label="Открыть стакан"
                      onClick={e => { e.stopPropagation(); onOpenOrderBook(r); }} />
                  )}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
