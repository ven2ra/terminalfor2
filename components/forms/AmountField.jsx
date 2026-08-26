import React from 'react';
/** Spend/Receive row: label, big editable amount, currency picker on the right. */
export function AmountField({ label, value, onChange, currency, readOnly, style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-6)',
      padding: '10px var(--sp-6)', background: 'var(--surface-inset)', border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-lg)', ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>{label}</span>
        <input value={value} onChange={onChange} readOnly={readOnly} inputMode="decimal"
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: 0,
            color: 'var(--text-primary)', font: 'var(--type-h3)', fontVariantNumeric: 'tabular-nums' }} />
      </div>
      {currency}
    </div>
  );
}
