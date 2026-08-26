import React from 'react';
import { Icon } from '../core/Icon.jsx';
/** Compact filter dropdown ("USDT", "Top Gainers", "7D"). Opens a hairline popover. */
export function SelectMenu({ options = [], value, onChange, leading, width, style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  return (
    <div {...rest} style={{ position: 'relative', ...style }}>
      <button type="button" onClick={() => setOpen(o => !o)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-4)', height: 'var(--control-h)', width,
          padding: '0 var(--sp-5)', background: hover || open ? 'var(--surface-raised)' : 'var(--surface-inset)',
          border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-control)', cursor: 'pointer',
          color: 'var(--text-body)', font: 'var(--type-body-sm)', fontWeight: 'var(--fw-medium)', transition: 'var(--t-hover)' }}>
        {leading}
        <span style={{ flex: 1, textAlign: 'left' }}>{value}</span>
        <Icon name="chevron-down" size={13} style={{ background: 'var(--text-faint)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast) var(--ease-standard)' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '100%', zIndex: 40,
          background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-popover)', padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {options.map(o => (
            <button key={o} type="button" onClick={() => { onChange && onChange(o); setOpen(false); }}
              style={{ textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer',
                background: o === value ? 'var(--surface-active)' : 'transparent',
                color: o === value ? 'var(--text-primary)' : 'var(--text-muted)', font: 'var(--type-body-sm)', whiteSpace: 'nowrap' }}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}
