import React from 'react';
/** Pill filter row over a table: All / Trends / Favorites / Top Gainers / Top Losers. */
export function FilterTabs({ options = [], value, onChange, style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap', ...style }}>
      {options.map(o => {
        const on = o === value;
        return (
          <button key={o} type="button" onClick={() => onChange && onChange(o)}
            style={{ height: 30, padding: '0 var(--sp-6)', cursor: 'pointer', borderRadius: 'var(--r-sm)',
              background: on ? 'var(--accent-soft)' : 'var(--surface-inset)',
              border: `1px solid ${on ? 'var(--border-accent)' : 'var(--border-hairline)'}`,
              color: on ? '#cfc7ff' : 'var(--text-muted)', font: 'var(--type-body-sm)',
              fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)', transition: 'var(--t-hover)' }}>{o}</button>
        );
      })}
    </div>
  );
}
