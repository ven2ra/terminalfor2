import React from 'react';
import { Icon } from './Icon.jsx';
/** Section title with a live-status eyebrow and a right-aligned actions slot. */
export function SectionHeader({ eyebrow, eyebrowIcon, title, live, actions, size = 'md', style, ...rest }) {
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--sp-8)', ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {eyebrow && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
            {live && <span style={{ width: 6, height: 6, borderRadius: 'var(--r-circle)', background: 'var(--text-body)', boxShadow: '0 0 0 3px rgba(255,255,255,.07)' }} />}
            {eyebrowIcon && <Icon name={eyebrowIcon} size={12} />}
            {eyebrow}
          </span>
        )}
        <h2 style={{ margin: 0, font: size === 'lg' ? 'var(--type-display)' : 'var(--type-h2)', letterSpacing: 'var(--ls-display)', color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>{actions}</div>}
    </div>
  );
}
