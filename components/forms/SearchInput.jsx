import React from 'react';
import { Icon } from '../core/Icon.jsx';
/** Topbar search field with a keyboard-shortcut affordance. */
export function SearchInput({ placeholder = 'Search...', shortcut = '/', value, onChange, width = 360, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', width, height: 'var(--control-h)',
      padding: '0 var(--sp-5)', background: 'var(--surface-inset)', borderRadius: 'var(--r-control)',
      border: `1px solid ${focus ? 'var(--border-accent)' : 'var(--border-hairline)'}`,
      boxShadow: focus ? 'var(--shadow-focus)' : 'none', transition: 'var(--t-hover),box-shadow var(--dur-fast) var(--ease-standard)', ...style }}>
      <Icon name="search" size={14} style={{ background: 'var(--text-faint)' }} />
      <input value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...rest}
        style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)',
          font: 'var(--type-body-sm)', letterSpacing: 'var(--ls-body)' }} />
      {shortcut && <kbd style={{ font: 'var(--type-numeric)', color: 'var(--text-faint)', background: 'var(--surface-raised)',
        border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-xs)', padding: '1px 5px' }}>{shortcut}</kbd>}
    </div>
  );
}
