import React from 'react';
/** Green/red OHLC candles — used for transaction volume and pair history. */
export function CandleChart({ candles = [], height = 150, gap = 2, style, ...rest }) {
  const lows = candles.map(c => c.l), highs = candles.map(c => c.h);
  const min = Math.min(...lows), max = Math.max(...highs), span = max - min || 1;
  const y = v => (1 - (v - min) / span) * height;
  return (
    <div {...rest} style={{ display: 'flex', alignItems: 'flex-end', gap, height, ...style }}>
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const color = up ? 'var(--chart-up)' : 'var(--chart-down)';
        const top = y(Math.max(c.o, c.c)), bot = y(Math.min(c.o, c.c));
        return (
          <div key={i} style={{ position: 'relative', flex: 1, height: '100%' }}>
            <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 1, top: y(c.h), height: Math.max(1, y(c.l) - y(c.h)), background: color, opacity: .55 }} />
            <span style={{ position: 'absolute', left: 0, right: 0, top, height: Math.max(2, bot - top), background: color, borderRadius: 1 }} />
          </div>
        );
      })}
    </div>
  );
}
