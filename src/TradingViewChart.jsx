import React from 'react';

/**
 * Embeds TradingView's free Advanced Chart widget for a MOEX-listed symbol.
 * Note: TradingView's free embed requires its own small attribution mark to stay
 * visible (part of their terms for the free widget) — the top/side toolbars are
 * hidden via the widget's own config, but that mark cannot be stripped.
 */
export function TradingViewChart({ symbol, height = 420, style }) {
  const hostRef = React.useRef(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = '';

    // TradingView's embed script reads its config from its own textContent and
    // looks for a sibling ".tradingview-widget-container__widget" div to mount
    // into — it must NOT be nested inside that div, only alongside it.
    const wrapper = document.createElement('div');
    wrapper.className = 'tradingview-widget-container';
    wrapper.style.height = '100%';
    wrapper.style.width = '100%';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    wrapper.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.text = JSON.stringify({
      autosize: true,
      symbol: `MOEX:${symbol}`,
      interval: '60',
      timezone: 'Europe/Moscow',
      theme: 'dark',
      style: '1',
      locale: 'ru',
      backgroundColor: '#0e1013',
      gridColor: 'rgba(255, 255, 255, 0.06)',
      hide_top_toolbar: false,
      hide_legend: false,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      support_host: 'https://www.tradingview.com',
    });
    wrapper.appendChild(script);

    host.appendChild(wrapper);

    return () => {
      host.innerHTML = '';
    };
  }, [symbol]);

  return <div ref={hostRef} style={{ height, width: '100%', ...style }} />;
}
