import React from 'react';
import { Icon } from './Icon.jsx';
const SZ = { sm: { h: 30, px: 12, fs: 'var(--fs-xs)' }, md: { h: 38, px: 16, fs: 'var(--fs-sm)' }, lg: { h: 44, px: 20, fs: 'var(--fs-base)' } };
/** Primary action. The hero variant is the violet gradient CTA ("Buy ETH") — one per view. */
export function Button({ variant = 'primary', size = 'md', icon, trailingIcon, fullWidth, disabled, children, style, ...rest }) {
  const s = SZ[size] || SZ.md;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const skin = {
    primary: { background: 'var(--gradient-cta)', color: 'var(--text-primary)', border: '1px solid rgba(107,92,255,.45)', boxShadow: hover ? 'var(--shadow-cta-glow)' : 'none' },
    secondary: { background: 'var(--surface-inset)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', boxShadow: 'none' },
    ghost: { background: hover ? 'var(--surface-hover)' : 'transparent', color: 'var(--text-muted)', border: '1px solid transparent', boxShadow: 'none' },
    danger: { background: 'var(--negative-soft)', color: 'var(--negative)', border: '1px solid rgba(239,68,68,.3)', boxShadow: 'none' },
  }[variant];
  return (
    <button type="button" disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)} {...rest}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-4)',
        height: s.h, padding: `0 ${s.px}px`, width: fullWidth ? '100%' : undefined,
        font: 'var(--type-body-sm)', fontSize: s.fs, fontWeight: 'var(--fw-semibold)', letterSpacing: 'var(--ls-body)',
        borderRadius: 'var(--r-control)', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .38 : 1, transition: 'var(--t-hover),var(--t-press),box-shadow var(--dur-base) var(--ease-standard)',
        transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
        filter: variant === 'secondary' && hover ? 'brightness(1.35)' : 'none', ...skin, ...style,
      }}>
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={size === 'sm' ? 13 : 15} />}
    </button>
  );
}
