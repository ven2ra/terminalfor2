import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SidebarNav } from '../../components/navigation/SidebarNav.jsx';
import { TopBar } from '../../components/navigation/TopBar.jsx';
import { Card } from '../../components/core/Card.jsx';
import { SectionHeader } from '../../components/core/SectionHeader.jsx';
import { IconButton } from '../../components/core/IconButton.jsx';
import { Icon } from '../../components/core/Icon.jsx';
import { Button } from '../../components/core/Button.jsx';
import { PriceValue } from '../../components/data/PriceValue.jsx';
import { DeltaChip } from '../../components/core/DeltaChip.jsx';
import { SegmentedControl } from '../../components/forms/SegmentedControl.jsx';
import { AmountField } from '../../components/forms/AmountField.jsx';
import { SelectMenu } from '../../components/forms/SelectMenu.jsx';
import { FilterTabs } from '../../components/forms/FilterTabs.jsx';
import { PriceChart } from '../PriceChart.jsx';
import { DraggableStack, useBlockRows, useBlockSizes } from '../DraggableBlocks.jsx';
import { NAV_GROUPS } from '../nav.js';
import { fetchInstrument, fetchTrades, fetchOrderBook, fetchNews, fetchCandles } from '../api.js';
import { useDemoAccount, placeOrder, cancelOrder, checkPendingOrders, commissionRate } from '../demoAccount.js';

const BLOCK_ORDER_KEY = 'tf2_instrument_block_order_v2';
const DEFAULT_ORDER = ['chart', 'orderbook', 'trades', 'order', 'position', 'news'];
const DEFAULT_BLOCK_HEIGHTS = { chart: 600, orderbook: 460, trades: 400, order: 480, position: 320, news: 360 };
const ORDER_TYPES = ['Рыночная', 'Лимитная', 'Стоп-лимит', 'Стоп-маркет'];

const TIMEFRAMES = [
  { code: '1m', label: '1м' },
  { code: '5m', label: '5м' },
  { code: '10m', label: '10м' },
  { code: '15m', label: '15м' },
  { code: '30m', label: '30м' },
  { code: '1h', label: '1ч' },
  { code: '4h', label: '4ч' },
  { code: '1d', label: '1д' },
  { code: '1w', label: '1н' },
];
const TF_LABEL = Object.fromEntries(TIMEFRAMES.map(t => [t.code, t.label]));

// Merges two candle arrays (each already sorted ascending by `t`) keyed by
// their timestamp string, so a fresh "recent window" poll updates the tail
// without discarding earlier history a scroll-back load prepended.
function mergeCandles(existing, incoming) {
  if (!incoming.length) return existing;
  const map = new Map(existing.map(c => [c.t, c]));
  for (const c of incoming) map.set(c.t, c);
  return Array.from(map.values()).sort((a, b) => a.t.localeCompare(b.t));
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function fmtRub(n, opts) {
  return Number(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2, ...opts });
}

export function Instrument() {
  const { market, board, symbol } = useParams();
  const navigate = useNavigate();
  const account = useDemoAccount();
  const [info, setInfo] = React.useState(null);
  const [candles, setCandles] = React.useState([]);
  const [chartLoading, setChartLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [reachedStart, setReachedStart] = React.useState(false);
  const candlesRef = React.useRef(candles);
  candlesRef.current = candles;
  const inFlightRef = React.useRef(false);
  const reachedStartRef = React.useRef(false);
  const [trades, setTrades] = React.useState([]);
  const [tradesSource, setTradesSource] = React.useState(null);
  const [book, setBook] = React.useState({ bids: [], asks: [], lotSize: 1 });
  const [news, setNews] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [rows, setRows] = useBlockRows(BLOCK_ORDER_KEY, DEFAULT_ORDER);
  const [sizes, setSize] = useBlockSizes(BLOCK_ORDER_KEY);
  const [tf, setTf] = React.useState('1h');
  const [largeTradesOnly, setLargeTradesOnly] = React.useState(false);
  const [indicators, setIndicators] = React.useState({ ma: false, ema: false, volume: false, rsi: false, macd: false });
  const [drawTool, setDrawTool] = React.useState(null);
  const [drawings, setDrawings] = React.useState([]);

  const [side, setSide] = React.useState('Купить');
  const [orderType, setOrderType] = React.useState('Рыночная');
  const [price, setPrice] = React.useState('');
  const [stopPrice, setStopPrice] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [submitted, setSubmitted] = React.useState(null);

  // Switching instruments reuses this page instance — clear stale data so the
  // previous symbol's price/candles/trades don't flash before the new ones load.
  React.useEffect(() => {
    setInfo(null);
    setCandles([]);
    setChartLoading(true);
    setTrades([]);
    setBook({ bids: [], asks: [], lotSize: 1 });
    setNews([]);
    setPrice('');
    setStopPrice('');
    setSubmitted(null);
    setDrawTool(null);
    try {
      const saved = JSON.parse(localStorage.getItem(`tf2_drawings_${symbol}`));
      setDrawings(Array.isArray(saved) ? saved : []);
    } catch {
      setDrawings([]);
    }
  }, [symbol, market, board]);

  const updateDrawings = React.useCallback(
    next => {
      setDrawings(next);
      try {
        localStorage.setItem(`tf2_drawings_${symbol}`, JSON.stringify(next));
      } catch {}
    },
    [symbol],
  );

  // A timeframe switch also needs a fresh candle history, but shouldn't touch
  // trades/order book/news which are unrelated to the chart's resolution.
  React.useEffect(() => {
    setCandles([]);
    setChartLoading(true);
    setReachedStart(false);
    setLoadingMore(false);
    reachedStartRef.current = false;
    inFlightRef.current = false;
  }, [tf, symbol, market, board]);

  // Scrolling the chart back near its earliest loaded bar asks for the page
  // before it — keeps going until the API returns nothing (start of the
  // instrument's trading history), so a user can, in principle, pan all the
  // way back to when it started trading.
  const loadEarlierCandles = React.useCallback(async () => {
    // A ref guard (not state) — subscribeVisibleLogicalRangeChange can fire
    // several times within one render tick while dragging, and state updates
    // aren't synchronous enough to block the second call.
    if (inFlightRef.current || reachedStartRef.current || !candlesRef.current.length) return;
    inFlightRef.current = true;
    setLoadingMore(true);
    try {
      const earliest = candlesRef.current[0].t;
      const c = await fetchCandles(symbol, market, board, tf, earliest);
      const got = c.candles || [];
      if (!got.length) {
        reachedStartRef.current = true;
        setReachedStart(true);
      } else {
        setCandles(prev => mergeCandles(prev, got));
      }
    } catch {
      // leave state as-is — the user can scroll again to retry
    } finally {
      inFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [symbol, market, board, tf]);

  // Instrument info + news barely change — a slow poll is enough.
  const load = React.useCallback(async () => {
    try {
      const [i, n] = await Promise.all([fetchInstrument(symbol, market, board), fetchNews(symbol, market, board)]);
      setInfo(i);
      setNews(n);
      setError(null);
      setPrice(p => (p ? p : i.priceRaw != null ? String(i.priceRaw) : ''));
    } catch (e) {
      setError(e.message);
    }
  }, [symbol, market, board]);

  // Chart, order book and trade tape are the "live" panels — poll them fast so the
  // page feels synced with the market instead of stepping in 15s jumps.
  const loadLive = React.useCallback(async () => {
    try {
      const [c, t, b] = await Promise.all([
        fetchCandles(symbol, market, board, tf),
        fetchTrades(symbol, market, board),
        fetchOrderBook(symbol, market, board),
      ]);
      setCandles(prev => mergeCandles(prev, c.candles || []));
      setChartLoading(false);
      setTrades(t.trades || []);
      setTradesSource(t.source);
      setBook(b);
      setError(null);

      const lastClose = c.candles?.length ? c.candles[c.candles.length - 1].c : null;
      if (lastClose) checkPendingOrders(symbol, lastClose);
    } catch (e) {
      setError(e.message);
    }
  }, [symbol, market, board, tf]);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  React.useEffect(() => {
    loadLive();
    const id = setInterval(loadLive, 2000);
    return () => clearInterval(id);
  }, [loadLive]);

  const lotSize = info?.lotSize || 1;
  const isMarket = orderType === 'Рыночная';
  const isLimitLike = orderType === 'Лимитная' || orderType === 'Стоп-лимит';
  const needsStop = orderType === 'Стоп-лимит' || orderType === 'Стоп-маркет';
  const effectivePrice = isMarket ? info?.priceRaw || 0 : Number(price) || 0;
  const qtyNum = Number(qty) || 0;
  const notional = effectivePrice * qtyNum * lotSize;
  const commission = notional * commissionRate();
  const totalCost = notional + commission;

  const position = account.positions[symbol];
  const pendingOrders = account.orders.filter(o => o.symbol === symbol);
  const unrealizedPnl = position ? (info?.priceRaw || position.avgPrice) * position.qty * lotSize - position.avgPrice * position.qty * lotSize : 0;
  const unrealizedPct = position && position.avgPrice ? ((info?.priceRaw || position.avgPrice) - position.avgPrice) / position.avgPrice * 100 : 0;

  const setQtyFromPercent = pct => {
    if (side === 'Продать') {
      const held = position?.qty || 0;
      setQty(String(Math.max(1, Math.floor((held * pct) / 100))));
      return;
    }
    const refPrice = isMarket ? info?.priceRaw || 0 : Number(price) || info?.priceRaw || 0;
    if (!refPrice) return;
    const budget = (account.cash * pct) / 100;
    const lots = Math.max(1, Math.floor(budget / (refPrice * lotSize)));
    setQty(String(lots));
  };

  const submitOrder = () => {
    const result = placeOrder({
      symbol,
      market,
      board,
      name: info?.name,
      side,
      type: orderType,
      qty: qtyNum,
      price: Number(price) || 0,
      stopPrice: Number(stopPrice) || 0,
      lastPrice: info?.priceRaw || 0,
    });
    setSubmitted({ ...result, side, type: orderType, qty: qtyNum, at: new Date() });
  };

  const fillPriceFromBook = p => setPrice(String(p));

  // Hotkeys: B/S = market buy/sell of the current qty, Esc = cancel all
  // pending orders on this instrument, +/- = qty by one. Disabled while
  // typing in any field so it doesn't hijack normal text entry.
  React.useEffect(() => {
    const handler = e => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'b' || e.key === 'B') {
        const result = placeOrder({ symbol, market, board, name: info?.name, side: 'Купить', type: 'Рыночная', qty: qtyNum || 1, lastPrice: info?.priceRaw || 0 });
        setSubmitted({ ...result, side: 'Купить', type: 'Рыночная', qty: qtyNum || 1, at: new Date() });
      } else if (e.key === 's' || e.key === 'S') {
        const result = placeOrder({ symbol, market, board, name: info?.name, side: 'Продать', type: 'Рыночная', qty: qtyNum || 1, lastPrice: info?.priceRaw || 0 });
        setSubmitted({ ...result, side: 'Продать', type: 'Рыночная', qty: qtyNum || 1, at: new Date() });
      } else if (e.key === 'Escape') {
        pendingOrders.forEach(o => cancelOrder(o.id));
      } else if (e.key === '+' || e.key === '=') {
        setQty(String((Number(qty) || 0) + 1));
      } else if (e.key === '-' || e.key === '_') {
        setQty(String(Math.max(1, (Number(qty) || 1) - 1)));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [symbol, market, board, info, qty, qtyNum, pendingOrders]);

  const positionLine = position
    ? { price: position.avgPrice, color: unrealizedPnl >= 0 ? '#4ade80' : '#fb7185', title: `Позиция ${position.qty}` }
    : null;
  const orderLines = pendingOrders.map(o => ({
    price: o.type === 'Стоп-маркет' ? o.stopPrice : o.price,
    color: o.side === 'Купить' ? '#4ade80' : '#fb7185',
    title: `${o.side === 'Купить' ? 'Buy' : 'Sell'} ${o.qty}`,
  }));

  const th = { font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)', fontWeight: 'var(--fw-medium)', textAlign: 'left', padding: '0 var(--sp-4) var(--sp-4)' };
  const td = { padding: 'var(--sp-3) var(--sp-4)', font: 'var(--type-numeric)', fontVariantNumeric: 'tabular-nums' };

  const displayedTrades = largeTradesOnly
    ? [...trades].sort((a, b) => b.qty * b.price - a.qty * a.price).slice(0, 20)
    : trades;

  const maxBookQty = Math.max(1, ...book.bids.map(l => l.qty), ...book.asks.map(l => l.qty));

  const blocks = info && {
    chart: (
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--sp-7) var(--sp-7) 0' }}>
          <SectionHeader
            title="График"
            eyebrow={`Реальные свечи MOEX · таймфрейм ${TF_LABEL[tf]} · B/S — купить/продать по рынку, Esc — снять заявки, +/− — кол-во`}
            actions={<FilterTabs options={TIMEFRAMES.map(t => t.label)} value={TF_LABEL[tf]} onChange={label => setTf(TIMEFRAMES.find(t => t.label === label).code)} />}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--sp-5)', padding: 'var(--sp-5) var(--sp-7) 0' }}>
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            {[['ma', 'MA 20'], ['ema', 'EMA 20'], ['volume', 'Объём'], ['rsi', 'RSI'], ['macd', 'MACD']].map(([key, label]) => (
              <Button
                key={key}
                variant={indicators[key] ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIndicators(p => ({ ...p, [key]: !p[key] }))}
              >
                {label}
              </Button>
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border-hairline)' }} />
          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            {[[null, 'Курсор'], ['hline', 'Уровень'], ['trendline', 'Линия'], ['rect', 'Прямоуг.'], ['fib', 'Фибоначчи']].map(([key, label]) => (
              <Button key={label} variant={drawTool === key ? 'primary' : 'ghost'} size="sm" onClick={() => setDrawTool(key)}>
                {label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => updateDrawings([])}>Очистить</Button>
          </div>
        </div>
        <div style={{ padding: 'var(--sp-6) var(--sp-5) var(--sp-3)' }}>
          <PriceChart
            resetKey={`${symbol}-${tf}`}
            candles={candles}
            loading={chartLoading}
            onNearStart={loadEarlierCandles}
            loadingMore={loadingMore}
            reachedStart={reachedStart}
            indicators={indicators}
            drawTool={drawTool}
            drawings={drawings}
            onDrawingsChange={updateDrawings}
            onPriceClick={fillPriceFromBook}
            positionLine={positionLine}
            orderLines={orderLines}
            height={Math.max(280, (sizes.chart ?? DEFAULT_BLOCK_HEIGHTS.chart) - 175)}
          />
        </div>
      </Card>
    ),
    orderbook: (
      <Card>
        <SectionHeader
          title="Стакан заявок"
          live={book.source === 'tinvest'}
          eyebrow={book.source === 'tinvest' ? `Реальный стакан · Т-Инвестиции · ${book.bids.length} уровней` : `Смоделировано вокруг текущей цены · демо · ${book.bids.length} уровней`}
          style={{ paddingBottom: 'var(--sp-5)' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }}>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Покупка, ₽</th><th style={{ ...th, textAlign: 'right' }}>Лоты</th><th style={{ ...th, textAlign: 'right' }}>Сумма, ₽</th></tr></thead>
              <tbody>
                {book.bids.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => fillPriceFromBook(r.price)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ ...td, color: 'var(--positive)', fontWeight: i === 0 ? 'var(--fw-bold)' : 'var(--fw-regular)', position: 'relative' }}>
                      <span style={{ position: 'absolute', inset: 0, right: `${100 - (r.qty / maxBookQty) * 100}%`, background: 'var(--positive-soft)', zIndex: 0 }} />
                      <span style={{ position: 'relative' }}>{fmtRub(r.price)}</span>
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--text-body)' }}>{r.qty.toLocaleString('ru-RU')}</td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--text-faint)' }}>{fmtRub(r.value, { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Продажа, ₽</th><th style={{ ...th, textAlign: 'right' }}>Лоты</th><th style={{ ...th, textAlign: 'right' }}>Сумма, ₽</th></tr></thead>
              <tbody>
                {book.asks.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => fillPriceFromBook(r.price)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ ...td, color: 'var(--negative)', fontWeight: i === 0 ? 'var(--fw-bold)' : 'var(--fw-regular)', position: 'relative' }}>
                      <span style={{ position: 'absolute', inset: 0, right: `${100 - (r.qty / maxBookQty) * 100}%`, background: 'var(--negative-soft)', zIndex: 0 }} />
                      <span style={{ position: 'relative' }}>{fmtRub(r.price)}</span>
                    </td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--text-body)' }}>{r.qty.toLocaleString('ru-RU')}</td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--text-faint)' }}>{fmtRub(r.value, { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ paddingTop: 'var(--sp-4)', font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
          Клик по цене — подставить в заявку · лот = {lotSize} шт
        </div>
      </Card>
    ),
    trades: (
      <Card>
        <SectionHeader
          title="Лента сделок"
          live={tradesSource === 'tinvest'}
          eyebrow={tradesSource === 'tinvest' ? 'Реальные сделки · Т-Инвестиции (~1-2 мин)' : 'Реальные сделки MOEX · анонимный доступ, ~15 мин'}
          actions={<FilterTabs options={['Все', 'Крупные']} value={largeTradesOnly ? 'Крупные' : 'Все'} onChange={v => setLargeTradesOnly(v === 'Крупные')} />}
          style={{ paddingBottom: 'var(--sp-6)' }}
        />
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Время</th><th style={{ ...th, textAlign: 'right' }}>Цена, ₽</th><th style={{ ...th, textAlign: 'right' }}>Кол-во</th></tr></thead>
            <tbody>
              {displayedTrades.map((t, i) => (
                <tr key={i}>
                  <td style={{ ...td, color: 'var(--text-faint)' }}>{t.time}</td>
                  <td style={{ ...td, textAlign: 'right', color: t.side === 'B' ? 'var(--positive)' : 'var(--negative)' }}>{fmtRub(t.price)}</td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--text-body)' }}>{t.qty.toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    ),
    order: (
      <Card variant="panel">
        <SectionHeader title="Новая заявка" eyebrow="Демо-режим · исполнение симулируется, но по настоящей логике" style={{ paddingBottom: 'var(--sp-7)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', maxWidth: 460 }}>
          <SegmentedControl options={['Купить', 'Продать']} value={side} onChange={setSide} />
          <SelectMenu options={ORDER_TYPES} value={orderType} onChange={setOrderType} />

          {!isMarket && (
            <AmountField
              label={needsStop ? 'Цена исполнения, ₽' : 'Цена, ₽'}
              value={price}
              onChange={e => setPrice(e.target.value)}
              currency="₽"
            />
          )}
          {needsStop && (
            <AmountField label="Стоп-цена, ₽" value={stopPrice} onChange={e => setStopPrice(e.target.value)} currency="₽" />
          )}
          <AmountField label="Количество" value={qty} onChange={e => setQty(e.target.value)} currency={`лот ${lotSize}`} />

          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            {[10, 25, 50, 100].map(pct => (
              <Button key={pct} variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => setQtyFromPercent(pct)}>
                {pct}%
              </Button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 'var(--sp-5)', background: 'var(--surface-inset)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
              <span>Сумма</span><span>{fmtRub(notional)} ₽</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
              <span>Комиссия ({(commissionRate() * 100).toFixed(2)}%)</span><span>{fmtRub(commission)} ₽</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-numeric-strong)', color: 'var(--text-primary)', paddingTop: 4, borderTop: '1px solid var(--border-hairline)' }}>
              <span>Итого</span><span>{fmtRub(totalCost)} ₽</span>
            </div>
            <div style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
              Доступно: {fmtRub(account.cash)} ₽
            </div>
          </div>

          <Button variant={side === 'Купить' ? 'primary' : 'danger'} size="lg" fullWidth onClick={submitOrder}>
            {side} {symbol}
          </Button>

          {submitted && (
            <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: submitted.ok ? 'var(--text-faint)' : 'var(--negative)' }}>
              {submitted.ok
                ? submitted.filled
                  ? `Исполнено: ${submitted.side} ${submitted.qty} лот × ${symbol} по рынку в ${submitted.at.toLocaleTimeString('ru-RU')}.`
                  : `Заявка «${submitted.type}» поставлена в очередь и исполнится при достижении цены — см. «Активные заявки» ниже.`
                : `Не выполнено: ${submitted.error}`}
            </span>
          )}
        </div>
      </Card>
    ),
    position: (
      <Card>
        <SectionHeader title="Позиция" eyebrow={`Демо-счёт · баланс ${fmtRub(account.cash)} ₽`} style={{ paddingBottom: 'var(--sp-6)' }} />
        {position ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-6)' }}>
              <div>
                <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Количество</div>
                <div style={{ font: 'var(--type-h3)', color: 'var(--text-primary)' }}>{position.qty.toLocaleString('ru-RU')} шт</div>
              </div>
              <div>
                <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Средняя цена</div>
                <div style={{ font: 'var(--type-h3)', color: 'var(--text-primary)' }}>{fmtRub(position.avgPrice)} ₽</div>
              </div>
              <div>
                <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Нереализ. P&L</div>
                <div style={{ font: 'var(--type-h3)', color: unrealizedPnl >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{fmtRub(unrealizedPnl)} ₽</div>
              </div>
              <div>
                <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>P&L, %</div>
                <DeltaChip value={unrealizedPct} showIcon />
              </div>
            </div>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                const result = placeOrder({ symbol, market, board, name: info?.name, side: 'Продать', type: 'Рыночная', qty: position.qty, lastPrice: info?.priceRaw || 0 });
                setSubmitted({ ...result, side: 'Продать', type: 'Рыночная', qty: position.qty, at: new Date() });
              }}
            >
              Закрыть позицию
            </Button>
          </div>
        ) : (
          <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>Нет открытой позиции по {symbol}.</div>
        )}

        {pendingOrders.length > 0 && (
          <div style={{ marginTop: 'var(--sp-7)', paddingTop: 'var(--sp-6)', borderTop: '1px solid var(--border-hairline)' }}>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)', paddingBottom: 'var(--sp-4)' }}>Активные заявки</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {pendingOrders.map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--surface-inset)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-body)' }}>
                    {o.side} {o.qty} лот · {o.type}{o.price ? ` по ${fmtRub(o.price)} ₽` : ''}{o.stopPrice ? ` (стоп ${fmtRub(o.stopPrice)} ₽)` : ''}
                  </span>
                  <IconButton icon="x" size={26} label="Отменить заявку" onClick={() => cancelOrder(o.id)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    ),
    news: (
      <Card>
        <SectionHeader title="Новости и события" eyebrow="Автолента на основе рыночных данных · демо" style={{ paddingBottom: 'var(--sp-6)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          {news.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--sp-5)', paddingTop: i ? 'var(--sp-5)' : 0, borderTop: i ? '1px solid var(--border-hairline)' : 'none' }}>
              <Icon name="newspaper" size={14} style={{ background: 'var(--text-faint)', marginTop: 3, flex: '0 0 auto' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-body)' }}>{n.text}</span>
                <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>{fmtTime(n.time)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    ),
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', background: 'var(--bg-app)' }}>
      <SidebarNav
        greeting="Terminalfor"
        meta="MOEX · Акции TQBR"
        groups={NAV_GROUPS}
        active="dashboard"
        logoutLabel="Выйти"
        style={{ position: 'sticky', top: 0, height: '100vh' }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg-app)' }}>
          <TopBar
            crumbs={['Торговля', symbol]}
            wallet="Демо-счёт"
            address="MOEX ISS"
            searchPlaceholder="Поиск инструмента..."
          />
        </div>
        <main style={{ padding: 'var(--sp-9)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
            <IconButton icon="chevron-left" size={34} label="Назад к торговле" onClick={() => navigate('/')} />
            <Link to="/" style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>Торговля</Link>
            <span style={{ color: 'var(--n-500)' }}>/</span>
            <span style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{symbol}</span>
          </div>

          {error && <Card style={{ color: 'var(--negative)' }}>Ошибка загрузки: {error}</Card>}

          {info && (
            <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-7)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>
                    {symbol} · {board} · {market === 'bonds' ? 'Облигация' : 'Акция'}
                  </span>
                  <span style={{ font: 'var(--type-h2)', color: 'var(--text-primary)' }}>{info.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
                  <PriceValue value={info.priceRaw} currency={market === 'bonds' ? '' : '₽'} suffix={market === 'bonds' ? '%' : undefined} size="md" />
                  <DeltaChip value={info.deltaRaw} showIcon />
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-8)', paddingTop: 'var(--sp-5)', borderTop: '1px solid var(--border-hairline)' }}>
                {[
                  ['Спред', info.spread != null ? `${fmtRub(info.spread)} ₽` : '—'],
                  ['Bid / Ask', info.bid != null && info.offer != null ? `${fmtRub(info.bid)} / ${fmtRub(info.offer)}` : '—'],
                  ['Диапазон дня', info.dayLow != null && info.dayHigh != null ? `${fmtRub(info.dayLow)} – ${fmtRub(info.dayHigh)}` : '—'],
                  ['С открытия', info.changeFromOpen != null ? `${info.changeFromOpen > 0 ? '+' : ''}${info.changeFromOpen}%` : '—'],
                  ['Объём, шт', info.volumeToday ? Math.round(info.volumeToday).toLocaleString('ru-RU') : '—'],
                  ['Оборот, ₽', info.turnoverToday ? Math.round(info.turnoverToday).toLocaleString('ru-RU') : '—'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>{label}</span>
                    <span style={{ font: 'var(--type-numeric-strong)', color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {blocks && (
            <DraggableStack
              rows={rows}
              onReorder={setRows}
              blocks={blocks}
              sizes={sizes}
              onResize={setSize}
              defaultSizes={DEFAULT_BLOCK_HEIGHTS}
            />
          )}
        </main>
      </div>
    </div>
  );
}
