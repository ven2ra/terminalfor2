import React from 'react';
/** Matte surface container. Elevation reads through surface value + hairline, not drop shadow. */
export function Card({ variant = 'card', padding, interactive, glow, children, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const surf = { card: 'var(--surface-card)', panel: 'var(--surface-panel)', inset: 'var(--surface-inset)' }[variant];
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...rest}
      style={{ position: 'relative', overflow: 'hidden', background: surf,
        border: `1px solid ${interactive && hover ? 'var(--border-subtle)' : 'var(--border-hairline)'}`,
        borderRadius: variant === 'panel' ? 'var(--r-panel)' : 'var(--r-card)',
        padding: padding ?? 'var(--pad-card)', transition: 'var(--t-hover)',
        cursor: interactive ? 'pointer' : undefined, ...style }}>
      {glow && <span style={{ position: 'absolute', inset: 0, background: `var(--glow-${glow})`, opacity: .5, pointerEvents: 'none' }} />}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}
