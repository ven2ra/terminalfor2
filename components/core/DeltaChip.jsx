import React from 'react';
import { Icon } from './Icon.jsx';
/** Signed percentage pill. Green tint up, red tint down — the most repeated element in the product. */
export function DeltaChip({ value, showIcon = false, size = 'md', style, ...rest }) {
  const up = value >= 0;
  const fmt = `${up ? '+' : '-'}${Math.abs(value).toFixed(2)}%`;
  const dense = size === 'sm';
  return (
    <span {...rest} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: dense ? 18 : 22,
      padding: dense ? '0 7px' : '0 9px', borderRadius: 'var(--r-chip)',
      background: up ? 'var(--positive-soft)' : 'var(--negative-soft)', color: up ? 'var(--positive)' : 'var(--negative)',
      font: 'var(--type-label)', fontSize: dense ? 'var(--fs-micro)' : 'var(--fs-tiny)', fontWeight: 'var(--fw-semibold)',
      fontVariantNumeric: 'tabular-nums', ...style }}>
      {showIcon && <Icon name={up ? 'trending-up' : 'trending-down'} size={dense ? 10 : 12} />}
      {fmt}
    </span>
  );
}
