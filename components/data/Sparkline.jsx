import React from 'react';
function path(points, w, h) {
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  return points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1) * w).toFixed(1)},${(h - (p - min) / span * h).toFixed(1)}`).join(' ');
}
/** Area sparkline with a soft under-glow — the chart language of every card and row. */
export function Sparkline({ points = [], width = 220, height = 64, tone = 'accent', markers = [], style, ...rest }) {
  const stroke = { accent: 'var(--chart-line)', up: 'var(--chart-up)', down: 'var(--chart-down)' }[tone];
  const id = React.useMemo(() => 'sg' + Math.random().toString(36).slice(2, 8), []);
  const d = path(points, width, height);
  const min = Math.min(...points), max = Math.max(...points), span = max - min || 1;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" {...rest} style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={stroke} stopOpacity=".35" /><stop offset="100%" stopColor={stroke} stopOpacity="0" />
      </linearGradient></defs>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {markers.map(i => {
        const x = i / (points.length - 1) * width, y = height - (points[i] - min) / span * height;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#fff" />;
      })}
    </svg>
  );
}
