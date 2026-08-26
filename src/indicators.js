// Plain technical-indicator math over an array of {time, open, high, low, close}
// candle bars (ascending by time). No library — these are the standard formulas.

export function sma(bars, period) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < bars.length; i++) {
    sum += bars[i].close;
    if (i >= period) sum -= bars[i - period].close;
    if (i >= period - 1) out.push({ time: bars[i].time, value: sum / period });
  }
  return out;
}

export function ema(bars, period) {
  const out = [];
  const k = 2 / (period + 1);
  let prev = null;
  for (let i = 0; i < bars.length; i++) {
    const close = bars[i].close;
    prev = prev == null ? close : close * k + prev * (1 - k);
    if (i >= period - 1) out.push({ time: bars[i].time, value: prev });
  }
  return out;
}

export function rsi(bars, period = 14) {
  const out = [];
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i < bars.length; i++) {
    const change = bars[i].close - bars[i - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    if (i <= period) {
      avgGain += gain / period;
      avgLoss += loss / period;
      if (i === period) out.push({ time: bars[i].time, value: rsiFromAvg(avgGain, avgLoss) });
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      out.push({ time: bars[i].time, value: rsiFromAvg(avgGain, avgLoss) });
    }
  }
  return out;
}

function rsiFromAvg(avgGain, avgLoss) {
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function emaSeriesRaw(values, period) {
  const k = 2 / (period + 1);
  const out = [];
  let prev = null;
  for (const v of values) {
    prev = prev == null ? v : v * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

export function macd(bars, fast = 12, slow = 26, signal = 9) {
  const closes = bars.map(b => b.close);
  const emaFast = emaSeriesRaw(closes, fast);
  const emaSlow = emaSeriesRaw(closes, slow);
  const macdLine = closes.map((_, i) => emaFast[i] - emaSlow[i]);
  const signalLine = emaSeriesRaw(macdLine, signal);
  const startIdx = slow - 1;
  const macdSeries = [];
  const signalSeries = [];
  const histSeries = [];
  for (let i = startIdx; i < bars.length; i++) {
    macdSeries.push({ time: bars[i].time, value: macdLine[i] });
    signalSeries.push({ time: bars[i].time, value: signalLine[i] });
    histSeries.push({ time: bars[i].time, value: macdLine[i] - signalLine[i] });
  }
  return { macdSeries, signalSeries, histSeries };
}
