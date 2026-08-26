import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Badge } from '../core/Badge.jsx';
/** The left rail: brand lockup, greeting, grouped nav sections, log out. */
export function SidebarNav({ brand = 'Terminalfor', tagline = 'AI-Powered Trading', greeting, meta, groups = [], active, onSelect, onCollapse, footer, style, ...rest }) {
  return (
    <nav {...rest} style={{ width: 'var(--rail-w)', flex: '0 0 auto', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-rail)', borderRight: '1px solid var(--border-hairline)', padding: 'var(--sp-7) var(--sp-6)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)', paddingBottom: 'var(--sp-8)' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <span style={{ font: 'var(--type-h3)', fontSize: 'var(--fs-base)', letterSpacing: 'var(--ls-heading)', color: 'var(--text-primary)' }}>{brand}</span>
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>{tagline}</span>
        </div>
        <button type="button" onClick={onCollapse} aria-label="Collapse sidebar"
          style={{ width: 24, height: 24, display: 'grid', placeItems: 'center', background: 'var(--surface-inset)',
            border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-sm)', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <Icon name="chevron-left" size={12} />
        </button>
      </div>
      {greeting && (
        <div style={{ paddingBottom: 'var(--sp-9)' }}>
          <h1 style={{ margin: 0, font: 'var(--type-h2)', letterSpacing: 'var(--ls-display)', color: 'var(--text-primary)' }}>{greeting}</h1>
          {meta && <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>{meta}</span>}
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)', overflow: 'hidden auto', scrollbarWidth: 'none' }}>
        {groups.map(g => (
          <div key={g.label} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--n-500)', padding: '0 var(--sp-5) var(--sp-3)' }}>{g.label}</span>
            {g.items.map(it => {
              const on = it.id === active;
              return (
                <button key={it.id} type="button" onClick={() => onSelect && onSelect(it.id)}
                  onMouseEnter={e => { if (!on) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', height: 33, flex: '0 0 auto', padding: '0 var(--sp-5)',
                    borderRadius: 'var(--r-nav-item)', cursor: 'pointer', textAlign: 'left',
                    background: on ? 'var(--gradient-nav-active)' : 'transparent',
                    border: `1px solid ${on ? 'var(--border-subtle)' : 'transparent'}`,
                    color: on ? 'var(--text-primary)' : 'var(--text-muted)',
                    font: 'var(--type-body-sm)', fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)', transition: 'var(--t-hover)' }}>
                  <Icon name={it.icon} size={16} />
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.badge && <Badge tone={it.badge === 'Beta' ? 'accent' : 'neutral'}>{it.badge}</Badge>}
                  {it.dot && <span style={{ width: 5, height: 5, borderRadius: 'var(--r-circle)', background: 'var(--text-faint)' }} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ paddingTop: 'var(--sp-8)' }}>{footer || (
        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', height: 36, width: '100%',
          padding: '0 var(--sp-5)', background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', font: 'var(--type-body-sm)', fontWeight: 'var(--fw-medium)' }}>
          <Icon name="log-out" size={16} />Log out
        </button>
      )}</div>
    </nav>
  );
}
