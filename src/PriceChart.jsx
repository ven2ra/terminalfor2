import React from 'react';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries, ColorType } from 'lightweight-charts';
import { sma, ema, rsi, macd } from './indicators.js';
import { useTheme } from './theme.js';

// lightweight-charts takes plain color strings via its own options object,
// not CSS custom properties — these can't just ride the --token cascade like
// the rest of the UI, so the grid/axis colors are recomputed by hand here
// whenever the theme flips.
const CHART_THEME = {
  dark: { text: '#8b90a0', grid: 'rgba(255,255,255,.05)', axis: 'rgba(255,255,255,.06)' },
  light: { text: '#565c6b', grid: 'rgba(10,12,20,.07)', axis: 'rgba(10,12,20,.1)' },
};

/** Deterministic candlestick silhouette shown while real data loads — no jitter on re-render. */
function ChartSkeleton() {
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

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_COLOR = 'rgba(107,92,255,.7)';

/**
 * Real MOEX candles rendered with TradingView's open-source lightweight-charts
 * library — our own data, no hosted widget, no external attribution required.
 * Also drives: overlay/oscillator indicators, a small drawing-tools layer
 * (horizontal level, trend line, rectangle, Fibonacci retracement), and price
 * lines for the demo position and any pending orders on this instrument.
 */
export function PriceChart({
  candles = [],
  loading,
  height = 420,
  resetKey,
  onNearStart,
  loadingMore,
  reachedStart,
  indicators = {},
  drawTool = null,
  drawings = [],
  onDrawingsChange,
  onPriceClick,
  positionLine,
  orderLines = [],
}) {
  const hostRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const chartRef = React.useRef(null);
  const seriesRef = React.useRef(null);
  const overlaySeriesRef = React.useRef({}); // MA/EMA/volume/RSI/MACD series, keyed by indicator name
  const firstBarTimeRef = React.useRef(null);
  const lastBarTimeRef = React.useRef(null);
  const barsRef = React.useRef([]);
  const onNearStartRef = React.useRef(onNearStart);
  onNearStartRef.current = onNearStart;
  const onPriceClickRef = React.useRef(onPriceClick);
  onPriceClickRef.current = onPriceClick;
  const drawToolRef = React.useRef(drawTool);
  drawToolRef.current = drawTool;
  const drawingsRef = React.useRef(drawings);
  drawingsRef.current = drawings;
  const onDrawingsChangeRef = React.useRef(onDrawingsChange);
  onDrawingsChangeRef.current = onDrawingsChange;
  const pendingPointRef = React.useRef(null);
  const positionLineRef = React.useRef(null);
  const orderLineRefsRef = React.useRef([]);
  const priceLineDrawingsRef = React.useRef(new Map());

  const theme = useTheme();
  const themeRef = React.useRef(theme);
  themeRef.current = theme;

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const ct = CHART_THEME[themeRef.current] || CHART_THEME.dark;
    const chart = createChart(host, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: ct.text,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: ct.grid },
        horzLines: { color: ct.grid },
      },
      timeScale: { borderColor: ct.axis, timeVisible: true },
      rightPriceScale: { borderColor: ct.axis },
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
      redraw();
    });

    chart.subscribeCrosshairMove(param => {
      if (pendingPointRef.current && param.point) {
        pendingPointRef.current.preview = pixelToPoint(param.point.x, param.point.y);
        redraw();
      }
    });

    chart.subscribeClick(param => {
      const tool = drawToolRef.current;
      if (!tool || !param.point) return;
      const point = pixelToPoint(param.point.x, param.point.y);
      if (!point) return;

      if (tool === 'hline') {
        const line = series.createPriceLine({
          price: point.price, color: '#6b5cff', lineWidth: 1, lineStyle: 2,
          title: point.price.toLocaleString('ru-RU', { maximumFractionDigits: 2 }),
        });
        const id = `hline-${Date.now()}`;
        priceLineDrawingsRef.current.set(id, line);
        onDrawingsChangeRef.current?.([...drawingsRef.current, { id, type: 'hline', price: point.price }]);
        return;
      }

      if (!pendingPointRef.current) {
        pendingPointRef.current = { start: point, preview: point };
        redraw();
      } else {
        const start = pendingPointRef.current.start;
        pendingPointRef.current = null;
        onDrawingsChangeRef.current?.([...drawingsRef.current, { id: `${tool}-${Date.now()}`, type: tool, points: [start, point] }]);
        redraw();
      }
    });

    function pixelToPoint(x, y) {
      const price = seriesRef.current?.coordinateToPrice(y);
      const time = chartRef.current?.timeScale().coordinateToTime(x);
      if (price == null || time == null) return null;
      return { time, price };
    }

    function pointToPixel(pt) {
      const x = chartRef.current?.timeScale().timeToCoordinate(pt.time);
      const y = seriesRef.current?.priceToCoordinate(pt.price);
      if (x == null || y == null) return null;
      return { x, y };
    }

    function redraw() {
      const canvas = canvasRef.current;
      if (!canvas || !chartRef.current) return;
      const rect = host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const shapes = [...drawingsRef.current];
      if (pendingPointRef.current) {
        const tool = drawToolRef.current;
        shapes.push({ id: '__pending', type: tool, points: [pendingPointRef.current.start, pendingPointRef.current.preview], pending: true });
      }

      for (const d of shapes) {
        if (d.type === 'hline') continue; // native price line, drawn by the chart itself
        const [p1, p2] = d.points || [];
        if (!p1 || !p2) continue;
        const a = pointToPixel(p1);
        const b = pointToPixel(p2);
        if (!a || !b) continue;
        ctx.save();
        ctx.strokeStyle = d.pending ? 'rgba(107,92,255,.5)' : '#6b5cff';
        ctx.fillStyle = 'rgba(107,92,255,.12)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash(d.pending ? [4, 4] : []);

        if (d.type === 'trendline') {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        } else if (d.type === 'rect') {
          const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
          const w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
          ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
        } else if (d.type === 'fib') {
          const lo = Math.min(p1.price, p2.price), hi = Math.max(p1.price, p2.price);
          const span = hi - lo;
          const left = Math.min(a.x, b.x), right = Math.max(a.x, b.x);
          ctx.font = '11px sans-serif';
          for (const lvl of FIB_LEVELS) {
            const price = hi - span * lvl;
            const y = seriesRef.current.priceToCoordinate(price);
            if (y == null) continue;
            ctx.strokeStyle = FIB_COLOR;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
            ctx.fillStyle = FIB_COLOR;
            ctx.fillText(`${(lvl * 100).toFixed(1)}% · ${price.toFixed(2)}`, right + 4, y + 3);
          }
        }
        ctx.restore();
      }
    }

    chartRef.current = chart;
    seriesRef.current = series;
    chartRef.current.__redraw = redraw;

    const ro = new ResizeObserver(() => redraw());
    ro.observe(host);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      overlaySeriesRef.current = {};
    };
  }, []);

  // Theme toggle: recolor the axes/grid in place via applyOptions rather than
  // tearing the chart down, so the user's current zoom/pan position survives.
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const ct = CHART_THEME[theme] || CHART_THEME.dark;
    chart.applyOptions({
      layout: { textColor: ct.text },
      grid: { vertLines: { color: ct.grid }, horzLines: { color: ct.grid } },
      timeScale: { borderColor: ct.axis },
      rightPriceScale: { borderColor: ct.axis },
    });
  }, [theme]);

  // Native chart click also fills the order-ticket price (outside drawing mode).
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const handler = param => {
      if (drawToolRef.current || !param.point || !seriesRef.current) return;
      const price = seriesRef.current.coordinateToPrice(param.point.y);
      if (price != null) onPriceClickRef.current?.(Number(price.toFixed(2)));
    };
    chart.subscribeClick(handler);
    return () => chart.unsubscribeClick?.(handler);
  }, []);

  // Remove native price lines for hline drawings that got cleared from the list.
  React.useEffect(() => {
    const ids = new Set(drawings.map(d => d.id));
    for (const [id, line] of priceLineDrawingsRef.current) {
      if (!ids.has(id)) {
        seriesRef.current?.removePriceLine(line);
        priceLineDrawingsRef.current.delete(id);
      }
    }
    chartRef.current?.__redraw?.();
  }, [drawings]);

  React.useEffect(() => {
    if (!seriesRef.current || !candles.length) return;
    const data = candles.map(toBar).filter(d => Number.isFinite(d.time)).sort((a, b) => a.time - b.time);
    barsRef.current = data;
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
    chartRef.current?.__redraw?.();
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

  // Indicator overlays: add/remove/refresh line & histogram series as the
  // enabled set or the underlying candle data changes.
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !barsRef.current.length) return;
    const bars = barsRef.current;
    const store = overlaySeriesRef.current;

    const ensure = (key, factory) => {
      if (!store[key]) store[key] = factory();
      return store[key];
    };
    const remove = key => {
      if (store[key]) {
        if (Array.isArray(store[key])) store[key].forEach(s => chart.removeSeries(s));
        else chart.removeSeries(store[key]);
        delete store[key];
      }
    };

    if (indicators.ma) ensure('ma', () => chart.addSeries(LineSeries, { color: '#f5b638', lineWidth: 1 })).setData(sma(bars, 20));
    else remove('ma');

    if (indicators.ema) ensure('ema', () => chart.addSeries(LineSeries, { color: '#4a90e2', lineWidth: 1 })).setData(ema(bars, 20));
    else remove('ema');

    if (indicators.volume) {
      const s = ensure('volume', () =>
        chart.addSeries(HistogramSeries, { priceFormat: { type: 'volume' }, priceScaleId: 'vol', color: 'rgba(139,144,160,.5)' }),
      );
      chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
      s.setData(bars.map(b => ({ time: b.time, value: b.high - b.low, color: b.close >= b.open ? 'rgba(34,197,94,.5)' : 'rgba(239,68,68,.5)' })));
    } else remove('volume');

    if (indicators.rsi) {
      const s = ensure('rsi', () => chart.addSeries(LineSeries, { color: '#cfc7ff', lineWidth: 1, priceScaleId: 'osc' }));
      chart.priceScale('osc').applyOptions({ scaleMargins: { top: 0.68, bottom: 0.12 } });
      s.setData(rsi(bars, 14));
    } else remove('rsi');

    if (indicators.macd) {
      const { macdSeries, signalSeries, histSeries } = macd(bars);
      const m = ensure('macdLine', () => chart.addSeries(LineSeries, { color: '#4ade80', lineWidth: 1, priceScaleId: 'osc2' }));
      const s = ensure('macdSignal', () => chart.addSeries(LineSeries, { color: '#fb7185', lineWidth: 1, priceScaleId: 'osc2' }));
      const h = ensure('macdHist', () => chart.addSeries(HistogramSeries, { priceScaleId: 'osc2', color: 'rgba(139,144,160,.5)' }));
      chart.priceScale('osc2').applyOptions({ scaleMargins: { top: 0.68, bottom: 0.12 } });
      m.setData(macdSeries);
      s.setData(signalSeries);
      h.setData(histSeries.map(d => ({ ...d, color: d.value >= 0 ? 'rgba(34,197,94,.5)' : 'rgba(239,68,68,.5)' })));
    } else {
      remove('macdLine');
      remove('macdSignal');
      remove('macdHist');
    }
  }, [indicators, candles]);

  // Position / pending-order price lines.
  React.useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (positionLineRef.current) {
      series.removePriceLine(positionLineRef.current);
      positionLineRef.current = null;
    }
    if (positionLine) {
      positionLineRef.current = series.createPriceLine({
        price: positionLine.price, color: positionLine.color, lineWidth: 2, lineStyle: 0, title: positionLine.title,
      });
    }
  }, [positionLine?.price, positionLine?.color, positionLine?.title]);

  React.useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    orderLineRefsRef.current.forEach(l => series.removePriceLine(l));
    orderLineRefsRef.current = orderLines.map(o =>
      series.createPriceLine({ price: o.price, color: o.color || '#f5b638', lineWidth: 1, lineStyle: 3, title: o.title }),
    );
  }, [orderLines]);

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      {loading && candles.length === 0 && <ChartSkeleton />}
      {loadingMore && (
        <span style={{ position: 'absolute', left: 'var(--sp-5)', top: 'var(--sp-4)', zIndex: 2, padding: '4px 10px', borderRadius: 'var(--r-pill)', background: 'var(--surface-raised)', border: '1px solid var(--border-hairline)', font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
          Загрузка истории…
        </span>
      )}
      {reachedStart && !loadingMore && (
        <span style={{ position: 'absolute', left: 'var(--sp-5)', top: 'var(--sp-4)', zIndex: 2, padding: '4px 10px', borderRadius: 'var(--r-pill)', background: 'var(--surface-raised)', border: '1px solid var(--border-hairline)', font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
          Начало истории торгов
        </span>
      )}
      <div ref={hostRef} style={{ height: '100%', width: '100%' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
    </div>
  );
}
