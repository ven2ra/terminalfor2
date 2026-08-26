import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { SearchInput } from '../forms/SearchInput.jsx';
/** App topbar: breadcrumb, centred search, utility icons, wallet chip. */
export function TopBar({ crumbs = [], wallet, address, onSearch, style, ...rest }) {
  return (
    <header {...rest} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-9)', height: 'var(--topbar-h)',
      padding: '0 var(--sp-9)', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-hairline)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', minWidth: 180 }}>
        <Icon name="home" size={15} style={{ background: 'var(--text-muted)' }} />
        {crumbs.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <span style={{ color: 'var(--n-500)', font: 'var(--type-body-sm)' }}>/</span>}
            <span style={{ font: 'var(--type-body-sm)', fontWeight: i === crumbs.length - 1 ? 'var(--fw-semibold)' : 'var(--fw-regular)',
              color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <SearchInput width={420} onChange={onSearch} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
        <IconButton icon="message-square" size={34} label="Messages" />
        <IconButton icon="bell" size={34} label="Notifications" dot />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', paddingLeft: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{wallet}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: 'var(--type-numeric)', color: 'var(--text-faint)' }}>
              {address}<Icon name="copy" size={11} />
            </span>
          </div>
          <Icon name="chevron-down" size={14} style={{ background: 'var(--text-faint)' }} />
        </div>
      </div>
    </header>
  );
}
