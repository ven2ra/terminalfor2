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

function toBar(c) {
  return { time: Math.floor(new Date(c.t.replace(' ', 'T') + 'Z').getTime() / 1000), open: c.o, high: c.h, low: c.l, close: c.c };
}

/** Real MOEX candles rendered with TradingView's open-source lightweight-charts library — our own data, no hosted widget, no external attribution required. */
export function PriceChart({ candles = [], loading, height = 420, resetKey, onNearStart, loadingMore, reachedStart }) {
  const hostRef = React.useRef(null);
  const chartRef = React.useRef(null);
  const seriesRef = React.useRef(null);
  const firstBarTimeRef = React.useRef(null);
  const lastBarTimeRef = React.useRef(null);
  const onNearStartRef = React.useRef(onNearStart);
  onNearStartRef.current = onNearStart;

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

    // Scrolling/zooming near the left edge of what's loaded asks the parent
    // for an earlier page of history (see Instrument.jsx's loadEarlierCandles).
    chart.timeScale().subscribeVisibleLogicalRangeChange(range => {
      if (range && range.from < 10) onNearStartRef.current?.();
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
    const data = candles.map(toBar).filter(d => Number.isFinite(d.time)).sort((a, b) => a.time - b.time);
    const first = data[0].time;
    const last = data[data.length - 1].time;

    if (lastBarTimeRef.current == null) {
      // First load (or a symbol/timeframe switch that reset the series): seed
      // the whole history and fit the view once.
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    } else if (first < firstBarTimeRef.current) {
      // An earlier page was prepended by a scroll-back load — replace the
      // full dataset, then shift the visible logical range by exactly how
      // many bars were added at the front so the view doesn't jump.
      const prevRange = chartRef.current?.timeScale().getVisibleLogicalRange();
      const oldFirstIdx = data.findIndex(d => d.time === firstBarTimeRef.current);
      const added = oldFirstIdx === -1 ? 0 : oldFirstIdx;
      seriesRef.current.setData(data);
      if (prevRange && added > 0) {
        chartRef.current?.timeScale().setVisibleLogicalRange({ from: prevRange.from + added, to: prevRange.to + added });
      }
    } else {
      // Routine live tick: a full setData() would reset the user's zoom/pan
      // on every 2s refresh, which reads as the chart "jumping" — only push
      // the latest bar.
      seriesRef.current.update(data[data.length - 1]);
    }
    firstBarTimeRef.current = first;
    lastBarTimeRef.current = last;
  }, [candles]);

  // The chart instance is created once and reused across symbol/timeframe
  // changes (the Instrument page doesn't remount) — force a full re-seed
  // whenever resetKey changes so we don't try to "update"/"prepend" against
  // a leftover bar from the previous instrument or timeframe.
  React.useEffect(() => {
    firstBarTimeRef.current = null;
    lastBarTimeRef.current = null;
    seriesRef.current?.setData([]);
  }, [resetKey]);

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      {loading && candles.length === 0 && <ChartSkeleton height={height} />}
      {loadingMore && (
        <span
          style={{
            position: 'absolute', left: 'var(--sp-5)', top: 'var(--sp-4)', zIndex: 2,
            padding: '4px 10px', borderRadius: 'var(--r-pill)', background: 'var(--surface-raised)',
            border: '1px solid var(--border-hairline)', font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)',
          }}
        >
          Загрузка истории…
        </span>
      )}
      {reachedStart && !loadingMore && (
        <span
          style={{
            position: 'absolute', left: 'var(--sp-5)', top: 'var(--sp-4)', zIndex: 2,
            padding: '4px 10px', borderRadius: 'var(--r-pill)', background: 'var(--surface-raised)',
            border: '1px solid var(--border-hairline)', font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)',
          }}
        >
          Начало истории торгов
        </span>
      )}
      <div ref={hostRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
