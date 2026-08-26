import React from 'react';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';

/** Deterministic candlestick silhouette shown while real data loads — no jitter on re-render. */
function ChartSkeleton({ height }) {
  const bars = React.useMemo(() => Array.from({ length: 48 }, (_, i) => 30 + Math.abs(Math.sin(i * 0.35)) * 55 + Math.sin(i * 0.9) * 10), []);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 3, padding: '0 var(--sp-6) var(--sp-8)', opacity: 0.35 }}>
      {bars.map((h, i) => (
        <span key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--surface-raised)', borderRadius: 2 }} />
      ))}
    </div>
  );
}

/** Real MOEX candles rendered with TradingView's open-source lightweight-charts library — our own data, no hosted widget, no external attribution required. */
export function PriceChart({ candles = [], loading, height = 420 }) {
  const hostRef = React.useRef(null);
  const chartRef = React.useRef(null);
  const seriesRef = React.useRef(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chart = createChart(host, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8b90a0',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,.05)' },
        horzLines: { color: 'rgba(255,255,255,.05)' },
      },
      timeScale: { borderColor: 'rgba(255,255,255,.06)', timeVisible: true },
      rightPriceScale: { borderColor: 'rgba(255,255,255,.06)' },
      crosshair: { mode: 0 },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: 'rgba(34,197,94,.55)',
      wickDownColor: 'rgba(239,68,68,.55)',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!seriesRef.current || !candles.length) return;
    const data = candles
      .map(c => ({ time: Math.floor(new Date(c.t.replace(' ', 'T') + 'Z').getTime() / 1000), open: c.o, high: c.h, low: c.l, close: c.c }))
      .filter(d => Number.isFinite(d.time))
      .sort((a, b) => a.time - b.time);
    seriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      {loading && candles.length === 0 && <ChartSkeleton height={height} />}
      <div ref={hostRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
