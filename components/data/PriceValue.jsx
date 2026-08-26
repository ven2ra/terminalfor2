import React from 'react';
/** Big price with de-emphasised trailing digits — integer white, decimals muted. */
export function PriceValue({ value, currency = '$', suffix, size = 'lg', style, ...rest }) {
  const str = typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value);
  const cut = Math.max(0, str.length - 3);
  const head = str.slice(0, cut), tail = str.slice(cut);
  const fonts = { sm: 'var(--type-h3)', md: 'var(--type-h2)', lg: 'var(--type-price)' };
  return (
    <div {...rest} style={{ font: fonts[size], letterSpacing: 'var(--ls-display)', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', ...style }}>
      {currency}{head}<span style={{ color: 'var(--n-400)' }}>{tail}</span>
      {suffix && <span style={{ color: 'var(--text-primary)', marginLeft: 6 }}>{suffix}</span>}
    </div>
  );
}
