import React from 'react';
import { Card } from '../core/Card.jsx';
import { IconButton } from '../core/IconButton.jsx';
import { DeltaChip } from '../core/DeltaChip.jsx';
import { CoinMark, COIN_COLOR } from './CoinMark.jsx';
import { PriceValue } from './PriceValue.jsx';
import { Sparkline } from './Sparkline.jsx';
/** Watch-tile for one trading pair: identity, price, delta and a glowing sparkline. */
export function AssetCard({ symbol, name, pair, price, delta, series = [], onMenu, style, ...rest }) {
  const tone = delta >= 0 ? 'up' : 'down';
  return (
    <Card interactive glow={tone} padding="var(--pad-card)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-5)' }}>
        <CoinMark symbol={symbol} size={30} ring />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>{pair}</span>
          <span style={{ font: 'var(--type-h3)', color: 'var(--text-primary)' }}>{name}</span>
        </div>
        <IconButton icon="ellipsis-vertical" size={26} label={`${name} actions`} onClick={onMenu} />
      </div>
      <div style={{ display: 'flex', gap: 'var(--sp-5)' }}>
        <span style={{ width: 'var(--bw-accent-tick)', borderRadius: 'var(--r-pill)', background: COIN_COLOR[String(symbol).toLowerCase()] || 'var(--accent)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>Price</span>
          <PriceValue value={price} />
          <DeltaChip value={delta} showIcon style={{ alignSelf: 'flex-start', marginTop: 2 }} />
        </div>
      </div>
      <Sparkline points={series} tone={tone} height={58} markers={series.length ? [Math.floor(series.length * .72)] : []} style={{ marginBottom: -16, marginInline: -16 }} />
    </Card>
  );
}
