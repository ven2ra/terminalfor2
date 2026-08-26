import React from 'react';
const BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@0.451.0/icons/';
/** Monochrome line glyph. Renders a Lucide SVG as a currentColor mask so it inherits text color. */
export function Icon({ name, size = 16, strokeWidth, color = 'currentColor', style, ...rest }) {
  const url = `url("${BASE}${name}.svg")`;
  return (
    <span aria-hidden="true" {...rest} style={{
      display: 'inline-block', width: size, height: size, flex: '0 0 auto',
      background: color, WebkitMaskImage: url, maskImage: url,
      WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain', maskSize: 'contain',
      WebkitMaskPosition: 'center', maskPosition: 'center', ...style,
    }} />
  );
}
