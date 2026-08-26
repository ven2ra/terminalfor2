import React from 'react';
/** Thin promo strip with a countdown, sitting on a magenta-to-transparent wash. */
export function PromoBanner({ children, countdown, style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-6)',
      padding: '9px var(--sp-7)', background: 'var(--gradient-promo)', borderBottom: '1px solid var(--border-hairline)', ...style }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-5)', font: 'var(--type-label)',
        fontSize: 'var(--fs-tiny)', color: 'var(--text-body)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 'var(--r-circle)', background: '#ff2d6f', boxShadow: '0 0 8px #ff2d6f' }} />
        {children}
      </span>
      {countdown && <span style={{ font: 'var(--type-numeric-strong)', color: 'var(--text-primary)' }}>{countdown}</span>}
    </div>
  );
}
