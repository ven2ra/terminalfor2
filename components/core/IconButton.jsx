import React from 'react';
import { Icon } from './Icon.jsx';
/** Square glyph-only control: card overflow menus, notifications, expand, collapse rail. */
export function IconButton({ icon, size = 32, variant = 'inset', label, dot, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const bg = variant === 'bare' ? (hover ? 'var(--surface-hover)' : 'transparent') : (hover ? 'var(--surface-raised)' : 'var(--surface-inset)');
  return (
    <button type="button" aria-label={label} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...rest}
      style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: bg, border: variant === 'bare' ? '1px solid transparent' : '1px solid var(--border-hairline)',
        borderRadius: 'var(--r-icon-btn)', color: hover ? 'var(--text-primary)' : 'var(--text-muted)',
        cursor: 'pointer', transition: 'var(--t-hover)', ...style }}>
      <Icon name={icon} size={Math.round(size * .48)} />
      {dot && <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: 'var(--r-circle)', background: 'var(--accent)' }} />}
    </button>
  );
}
