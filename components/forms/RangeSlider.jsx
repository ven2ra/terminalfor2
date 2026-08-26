import React from 'react';
/** Percentage-of-balance slider with a violet glow track. */
export function RangeSlider({ value = 0, onChange, showValue = true, style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', ...style }}>
      <div style={{ position: 'relative', flex: 1, height: 16, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', inset: '6px 0', borderRadius: 'var(--r-pill)', background: 'var(--surface-raised)' }} />
        <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: `${value}%`, borderRadius: 'var(--r-pill)',
          background: 'linear-gradient(90deg,#2a2472,#8b7bff)', boxShadow: '0 0 12px rgba(139,123,255,.5)' }} />
        <span style={{ position: 'absolute', left: `calc(${value}% - 6px)`, width: 12, height: 12, borderRadius: 'var(--r-circle)',
          background: '#fff', boxShadow: '0 0 0 3px rgba(139,123,255,.35)' }} />
        <input type="range" min={0} max={100} value={value} onChange={e => onChange && onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
      </div>
      {showValue && <span style={{ font: 'var(--type-label)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums', minWidth: 34, textAlign: 'right' }}>{value}%</span>}
    </div>
  );
}
