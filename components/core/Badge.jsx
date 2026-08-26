import React from 'react';
/** Tiny status label: "Beta" next to a nav item, a count on Support, "Live" on a panel. */
export function Badge({ tone = 'accent', children, style, ...rest }) {
  const skin = {
    accent: { background: 'rgba(107,92,255,.9)', color: '#fff', border: '1px solid transparent' },
    neutral: { background: 'var(--surface-raised)', color: 'var(--text-body)', border: '1px solid var(--border-hairline)' },
    positive: { background: 'var(--positive-soft)', color: 'var(--positive)', border: '1px solid rgba(34,197,94,.25)' },
    negative: { background: 'var(--negative-soft)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,.25)' },
    warn: { background: 'rgba(245,182,56,.14)', color: 'var(--warn-500)', border: '1px solid rgba(245,182,56,.25)' },
  }[tone];
  return (
    <span {...rest} style={{ display: 'inline-flex', alignItems: 'center', height: 16, padding: '0 6px', borderRadius: 'var(--r-xs)',
      font: 'var(--type-eyebrow)', fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-label)', ...skin, ...style }}>{children}</span>
  );
}
