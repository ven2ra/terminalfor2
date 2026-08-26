import React from 'react';
/** Buy / Sell / Swap style switch inside an inset track. */
export function SegmentedControl({ options = [], value, onChange, fullWidth = true, style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', gap: 2, padding: 3, background: 'var(--surface-inset)',
      border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-control)', width: fullWidth ? '100%' : undefined, ...style }}>
      {options.map(o => {
        const on = o === value;
        return (
          <button key={o} type="button" onClick={() => onChange && onChange(o)}
            style={{ flex: 1, height: 30, border: 'none', cursor: 'pointer', borderRadius: 'var(--r-sm)',
              background: on ? 'var(--surface-raised)' : 'transparent', color: on ? 'var(--text-primary)' : 'var(--text-faint)',
              font: 'var(--type-body-sm)', fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)',
              boxShadow: on ? 'var(--shadow-inset-hairline)' : 'none', transition: 'var(--t-hover)' }}>{o}</button>
        );
      })}
    </div>
  );
}
