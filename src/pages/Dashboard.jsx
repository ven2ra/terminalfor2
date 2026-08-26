import React from 'react';
import { SidebarNav } from '../../components/navigation/SidebarNav.jsx';
import { TopBar } from '../../components/navigation/TopBar.jsx';
import { TickerStrip } from '../../components/data/TickerStrip.jsx';
import { Card } from '../../components/core/Card.jsx';
import { Button } from '../../components/core/Button.jsx';
import { SectionHeader } from '../../components/core/SectionHeader.jsx';
import { DeltaChip } from '../../components/core/DeltaChip.jsx';
import { PriceValue } from '../../components/data/PriceValue.jsx';
import { CoinMark } from '../../components/data/CoinMark.jsx';
import { SegmentedControl } from '../../components/forms/SegmentedControl.jsx';
import { SelectMenu } from '../../components/forms/SelectMenu.jsx';
import { AmountField } from '../../components/forms/AmountField.jsx';
import { FilterTabs } from '../../components/forms/FilterTabs.jsx';
import { SearchInput } from '../../components/forms/SearchInput.jsx';
import { PriceChart } from '../PriceChart.jsx';
import { fetchSecurities, fetchInstrument, fetchCandles, fetchOrderBook } from '../api.js';
import { NAV_GROUPS } from '../nav.js';
import { Icon } from '../../components/core/Icon.jsx';
import { DraggableStack, useBlockRows, useBlockSizes, useWidgetVisibility } from '../DraggableBlocks.jsx';
import { useDemoAccount, placeOrder, cancelOrder, checkPendingOrders, commissionRate } from '../demoAccount.js';

const ORDER_TYPES = ['Рыночная', 'Лимитная', 'Стоп-лимит', 'Стоп-маркет'];
const TIMEFRAMES = [
  { code: '1m', label: '1м' }, { code: '5m', label: '5м' }, { code: '15m', label: '15м' },
  { code: '1h', label: '1ч' }, { code: '4h', label: '4ч' }, { code: '1d', label: '1д' },
];

const WORKSPACE_KEY = 'tf2_dash_workspace_v1';
const WIDGET_IDS = ['watchlist', 'chart', 'order', 'portfolio', 'orderbook'];
const WIDGET_LABELS = { watchlist: 'Инструменты', chart: 'График', order: 'Новая заявка', portfolio: 'Портфель', orderbook: 'Стакан заявок' };
const DEFAULT_WORKSPACE_ROWS = [['watchlist', 'chart', 'order'], ['portfolio', 'orderbook']];
const DEFAULT_WORKSPACE_HEIGHTS = { watchlist: 700, chart: 460, order: 460, portfolio: 300, orderbook: 420 };

function fmtRub(n, opts) {
  return Number(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2, ...opts });
}

function mergeCandles(existing, incoming) {
  if (!incoming.length) return existing;
  const map = new Map(existing.map(c => [c.t, c]));
  for (const c of incoming) map.set(c.t, c);
  return Array.from(map.values()).sort((a, b) => a.t.localeCompare(b.t));
}

// Flags a brief 'up'/'down' pulse whenever a numeric value ticks — drives the
// green/red price-flash background on the active instrument's price.
function usePriceFlash(value) {
  const [flash, setFlash] = React.useState(null);
  const prevRef = React.useRef(value);

  React.useEffect(() => {
    const prev = prevRef.current;
    if (prev != null && value != null && value !== prev) {
      setFlash(value > prev ? 'up' : 'down');
    }
    prevRef.current = value;
  }, [value]);

  React.useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [flash]);

  return flash;
}

export function Dashboard() {
  const account = useDemoAccount();

  const [watchlist, setWatchlist] = React.useState([]);
  const [watchlistError, setWatchlistError] = React.useState(null);
  const [watchlistQuery, setWatchlistQuery] = React.useState('');
  const [active, setActive] = React.useState(null); // { symbol, market, board, name }
  const [extraQuotes, setExtraQuotes] = React.useState({});

  const [info, setInfo] = React.useState(null);
  const [tf, setTf] = React.useState('1h');
  const [candles, setCandles] = React.useState([]);
  const [chartLoading, setChartLoading] = React.useState(true);
  const [book, setBook] = React.useState({ bids: [], asks: [], lotSize: 1 });

  const [side, setSide] = React.useState('Купить');
  const [orderType, setOrderType] = React.useState('Рыночная');
  const [price, setPrice] = React.useState('');
  const [stopPrice, setStopPrice] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [submitted, setSubmitted] = React.useState(null);

  const [rows, setRows, resetRows] = useBlockRows(WORKSPACE_KEY, DEFAULT_WORKSPACE_ROWS);
  const [sizes, setSize, resetSizes] = useBlockSizes(WORKSPACE_KEY);
  const [visible, toggleVisible, setVisible, resetVisible] = useWidgetVisibility(WORKSPACE_KEY, WIDGET_IDS);
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);

  const priceFlash = usePriceFlash(info?.priceRaw);

  const resetLayout = () => {
    resetRows();
    resetSizes();
    resetVisible();
  };
  const hiddenWidgetIds = WIDGET_IDS.filter(id => !visible[id]);

  // Watchlist: top instruments by today's turnover.
  const loadWatchlist = React.useCallback(async () => {
    try {
      const rows = await fetchSecurities('shares');
      setWatchlist(rows);
      setWatchlistError(null);
      setActive(prev => prev || (rows[0] ? { symbol: rows[0].symbol, market: rows[0].market, board: rows[0].board, name: rows[0].name } : null));
    } catch (e) {
      setWatchlistError(e.message);
    }
  }, []);

  React.useEffect(() => {
    loadWatchlist();
    const id = setInterval(loadWatchlist, 5000);
    return () => clearInterval(id);
  }, [loadWatchlist]);

  // Held/pending symbols the watchlist doesn't cover still need a live price
  // for the portfolio widget — fetched individually using the market/board
  // demoAccount already stored for them.
  React.useEffect(() => {
    const known = new Set(watchlist.map(r => r.symbol));
    const need = [];
    Object.entries(account.positions).forEach(([sym, p]) => {
      if (!known.has(sym) && !need.some(n => n.symbol === sym)) need.push({ symbol: sym, market: p.market || 'shares', board: p.board || 'TQBR' });
    });
    if (!need.length) return;
    let cancelled = false;
    Promise.all(need.map(n => fetchInstrument(n.symbol, n.market, n.board).catch(() => null))).then(results => {
      if (cancelled) return;
      setExtraQuotes(prev => {
        const next = { ...prev };
        results.forEach((r, i) => { if (r) next[need[i].symbol] = r; });
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [watchlist, account.positions]);

  const getQuote = React.useCallback(symbol => watchlist.find(r => r.symbol === symbol) || extraQuotes[symbol] || null, [watchlist, extraQuotes]);

  const filteredWatchlist = React.useMemo(() => {
    const q = watchlistQuery.trim().toLocaleLowerCase();
    if (!q) return watchlist;
    return watchlist.filter(r => r.symbol.toLocaleLowerCase().includes(q) || (r.name || '').toLocaleLowerCase().includes(q));
  }, [watchlist, watchlistQuery]);

  // Switching the active instrument resets everything specific to it.
  React.useEffect(() => {
    if (!active) return;
    setInfo(null);
    setCandles([]);
    setChartLoading(true);
    setBook({ bids: [], asks: [], lotSize: 1 });
    setPrice('');
    setStopPrice('');
    setSubmitted(null);
  }, [active?.symbol, active?.market, active?.board]);

  const loadInfo = React.useCallback(async () => {
    if (!active) return;
    try {
      const i = await fetchInstrument(active.symbol, active.market, active.board);
      setInfo(i);
      setPrice(p => (p ? p : i.priceRaw != null ? String(i.priceRaw) : ''));
    } catch {
      // leave stale info in place — the next tick retries
    }
  }, [active?.symbol, active?.market, active?.board]);

  const loadLive = React.useCallback(async () => {
    if (!active) return;
    try {
      const [c, b] = await Promise.all([
        fetchCandles(active.symbol, active.market, active.board, tf),
        fetchOrderBook(active.symbol, active.market, active.board),
      ]);
      setCandles(prev => mergeCandles(prev, c.candles || []));
      setChartLoading(false);
      setBook(b);
      const lastClose = c.candles?.length ? c.candles[c.candles.length - 1].c : null;
      if (lastClose) checkPendingOrders(active.symbol, lastClose);
    } catch {
      // leave stale data in place — the next tick retries
    }
  }, [active?.symbol, active?.market, active?.board, tf]);

  React.useEffect(() => {
    loadInfo();
    const id = setInterval(loadInfo, 10000);
    return () => clearInterval(id);
  }, [loadInfo]);

  React.useEffect(() => {
    loadLive();
    const id = setInterval(loadLive, 2000);
    return () => clearInterval(id);
  }, [loadLive]);

  const ticker = watchlist.slice(0, 10).map(r => ({ symbol: r.symbol, price: r.price, quote: 'RUB' }));
  const selectInstrument = r => setActive({ symbol: r.symbol, market: r.market, board: r.board, name: r.name });

  const lotSize = info?.lotSize || 1;
  const isMarket = orderType === 'Рыночная';
  const needsStop = orderType === 'Стоп-лимит' || orderType === 'Стоп-маркет';
  const effectivePrice = isMarket ? info?.priceRaw || 0 : Number(price) || 0;
  const qtyNum = Number(qty) || 0;
  const notional = effectivePrice * qtyNum * lotSize;
  const commission = notional * commissionRate();
  const totalCost = notional + commission;
  const position = active && account.positions[active.symbol];
  const fillPriceFromBook = p => setPrice(String(p));

  const setQtyFromPercent = pct => {
    if (side === 'Продать') {
      const held = position?.qty || 0;
      setQty(String(Math.max(1, Math.floor((held * pct) / 100))));
      return;
    }
    const refPrice = isMarket ? info?.priceRaw || 0 : Number(price) || info?.priceRaw || 0;
    if (!refPrice) return;
    const budget = (account.cash * pct) / 100;
    setQty(String(Math.max(1, Math.floor(budget / (refPrice * lotSize)))));
  };

  const submitOrder = () => {
    if (!active) return;
    const result = placeOrder({
      symbol: active.symbol, market: active.market, board: active.board, name: info?.name || active.name,
      side, type: orderType, qty: qtyNum, price: Number(price) || 0, stopPrice: Number(stopPrice) || 0, lastPrice: info?.priceRaw || 0,
    });
    setSubmitted({ ...result, side, type: orderType, qty: qtyNum, at: new Date() });
  };

  const maxBookQty = Math.max(1, ...book.bids.map(l => l.qty), ...book.asks.map(l => l.qty));
  const bookTh = { font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)', fontWeight: 'var(--fw-medium)', textAlign: 'left', padding: '0 var(--sp-4) var(--sp-4)' };
  const bookTd = { padding: 'var(--sp-3) var(--sp-4)', font: 'var(--type-numeric)', fontVariantNumeric: 'tabular-nums' };

  const watchlistCard = (
    <Card style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--sp-6) var(--sp-6) var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <SectionHeader
          title="Инструменты"
          size="sm"
          live={!watchlistError}
          eyebrow={watchlistError ? `Ошибка: ${watchlistError}` : 'Топ по обороту'}
        />
        <SearchInput
          value={watchlistQuery}
          onChange={e => setWatchlistQuery(e.target.value)}
          placeholder="Тикер или название..."
          shortcut={null}
          width="100%"
        />
      </div>
      <div style={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={bookTh}>Инструмент</th>
              <th style={{ ...bookTh, textAlign: 'right' }}>Оборот</th>
              <th style={{ ...bookTh, textAlign: 'right' }}>Цена</th>
              <th style={{ ...bookTh, textAlign: 'right' }}>Изм. %</th>
            </tr>
          </thead>
          <tbody>
            {filteredWatchlist.length === 0 && (
              <tr><td colSpan={4} style={{ ...bookTd, textAlign: 'center', color: 'var(--text-faint)', padding: 'var(--sp-7)' }}>Ничего не найдено</td></tr>
            )}
            {filteredWatchlist.map(r => {
              const isActive = active && active.symbol === r.symbol;
              return (
                <tr key={r.symbol} onClick={() => selectInstrument(r)}
                  style={{ cursor: 'pointer', background: isActive ? 'var(--surface-active)' : 'transparent', transition: 'var(--t-hover)' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ ...bookTd, font: 'var(--type-body-sm)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                      <CoinMark symbol={r.symbol} size={18} />
                      <span style={{ fontWeight: isActive ? 'var(--fw-semibold)' : 'var(--fw-regular)', color: isActive ? 'var(--text-primary)' : 'var(--text-body)' }}>{r.symbol}</span>
                    </span>
                  </td>
                  <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-faint)' }}>{r.marketCap}</td>
                  <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-primary)' }}>{r.price}</td>
                  <td style={{ ...bookTd, textAlign: 'right' }}><DeltaChip value={r.deltaRaw} size="sm" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const chartCard = (
    <Card style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'var(--sp-6) var(--sp-6) 0', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--sp-5)' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)', overflowWrap: 'anywhere' }}>
            {active ? `${active.symbol} · ${info?.name || active.name || ''}` : 'Выберите инструмент'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--sp-5)' }}>
            <span
              style={{
                display: 'inline-block', borderRadius: 'var(--r-md)', padding: '2px var(--sp-4)', margin: '-2px calc(var(--sp-4) * -1)',
                background: priceFlash === 'up' ? 'var(--positive-soft)' : priceFlash === 'down' ? 'var(--negative-soft)' : 'transparent',
                transition: 'background-color 550ms ease-out',
              }}
            >
              <PriceValue value={info?.priceRaw} currency="" suffix="₽" size="lg" />
            </span>
            {info && <DeltaChip value={info.deltaRaw} showIcon />}
          </div>
        </div>
        <FilterTabs options={TIMEFRAMES.map(t => t.label)} value={TIMEFRAMES.find(t => t.code === tf)?.label} onChange={label => setTf(TIMEFRAMES.find(t => t.label === label).code)} />
      </div>
      <div style={{ padding: 'var(--sp-5) var(--sp-4) var(--sp-3)', flex: 1, minHeight: 0 }}>
        <PriceChart
          resetKey={`${active?.symbol}-${tf}`}
          candles={candles}
          loading={chartLoading}
          indicators={{ volume: true }}
          height={Math.max(220, (sizes.chart?.h ?? DEFAULT_WORKSPACE_HEIGHTS.chart) - 150)}
        />
      </div>
    </Card>
  );

  const portfolioContent = React.useMemo(() => {
    const symbols = Object.keys(account.positions);
    const priced = symbols.map(sym => {
      const pos = account.positions[sym];
      const q = getQuote(sym);
      const last = q?.priceRaw ?? pos.avgPrice;
      const value = last * pos.qty;
      const pnl = (last - pos.avgPrice) * pos.qty;
      const pnlPct = pos.avgPrice ? ((last - pos.avgPrice) / pos.avgPrice) * 100 : 0;
      return { sym, pos, last, value, pnl, pnlPct };
    });
    const totalValue = account.cash + priced.reduce((s, p) => s + p.value, 0);
    const totalPnl = priced.reduce((s, p) => s + p.pnl, 0);
    const costBasis = priced.reduce((s, p) => s + p.pos.avgPrice * p.pos.qty, 0);
    const totalPnlPct = costBasis ? (totalPnl / costBasis) * 100 : 0;

    return (
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <SectionHeader title="Портфель" size="sm" eyebrow="Демо-счёт" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--sp-5)' }}>
          <div>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Стоимость</div>
            <PriceValue value={totalValue} currency="₽" size="sm" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Свободно</div>
            <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-body)' }}>{fmtRub(account.cash, { maximumFractionDigits: 0 })} ₽</span>
          </div>
          {priced.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>P&L</div>
              <DeltaChip value={totalPnlPct} showIcon />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', overflow: 'auto', flex: 1, minHeight: 0 }}>
          {!priced.length && <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Нет открытых позиций</span>}
          {priced.map(p => (
            <div key={p.sym} onClick={() => selectInstrument({ ...p.pos, symbol: p.sym })}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-3) 0', borderTop: '1px solid var(--border-hairline)', cursor: 'pointer' }}>
              <CoinMark symbol={p.sym} size={18} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{p.sym}</div>
                <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>{p.pos.qty} шт · сред. {fmtRub(p.pos.avgPrice)} ₽</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{fmtRub(p.value, { maximumFractionDigits: 0 })} ₽</div>
                <DeltaChip value={p.pnlPct} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }, [account.positions, account.cash, watchlist, extraQuotes]);

  const orderCard = (
    <Card variant="panel" style={{ height: '100%', overflow: 'auto' }}>
      <SectionHeader title="Новая заявка" size="sm" eyebrow="Демо-режим · исполнение по настоящей логике" style={{ paddingBottom: 'var(--sp-6)' }} />
      {!active ? (
        <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Выберите инструмент слева</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <SegmentedControl options={['Купить', 'Продать']} value={side} onChange={setSide} />
          <SelectMenu options={ORDER_TYPES} value={orderType} onChange={setOrderType} />
          {!isMarket && (
            <AmountField label={needsStop ? 'Цена исполнения, ₽' : 'Цена, ₽'} value={price} onChange={e => setPrice(e.target.value)} currency="₽" />
          )}
          {needsStop && <AmountField label="Стоп-цена, ₽" value={stopPrice} onChange={e => setStopPrice(e.target.value)} currency="₽" />}
          <AmountField label="Количество" value={qty} onChange={e => setQty(e.target.value)} currency={`лот ${lotSize}`} />
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            {[10, 25, 50, 100].map(pct => (
              <Button key={pct} variant="secondary" size="sm" style={{ flex: '1 1 60px' }} onClick={() => setQtyFromPercent(pct)}>{pct}%</Button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 'var(--sp-5)', background: 'var(--surface-inset)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}><span>Сумма</span><span>{fmtRub(notional)} ₽</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}><span>Комиссия ({(commissionRate() * 100).toFixed(2)}%)</span><span>{fmtRub(commission)} ₽</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, font: 'var(--type-numeric-strong)', color: 'var(--text-primary)', paddingTop: 4, borderTop: '1px solid var(--border-hairline)' }}><span>Итого</span><span>{fmtRub(totalCost)} ₽</span></div>
          </div>
          <Button variant={side === 'Купить' ? 'primary' : 'danger'} size="lg" fullWidth onClick={submitOrder}>{side} {active.symbol}</Button>
          {submitted && (
            <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: submitted.ok ? 'var(--text-faint)' : 'var(--negative)' }}>
              {submitted.ok
                ? submitted.filled
                  ? `Исполнено: ${submitted.side} ${submitted.qty} лот по рынку в ${submitted.at.toLocaleTimeString('ru-RU')}.`
                  : `Заявка «${submitted.type}» поставлена в очередь.`
                : `Не выполнено: ${submitted.error}`}
            </span>
          )}
        </div>
      )}
    </Card>
  );

  const orderbookCard = (
    <Card style={{ height: '100%', overflow: 'auto' }}>
      <SectionHeader
        title="Стакан заявок"
        size="sm"
        live={book.source === 'tinvest'}
        eyebrow={book.source === 'tinvest' ? 'Реальный стакан · Т-Инвестиции' : 'Смоделировано · демо'}
        style={{ paddingBottom: 'var(--sp-5)' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--sp-5)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={bookTh}>Покупка</th><th style={{ ...bookTh, textAlign: 'right' }}>Лоты</th></tr></thead>
          <tbody>
            {book.bids.map((r, i) => (
              <tr key={i} onClick={() => fillPriceFromBook(r.price)} style={{ cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <td style={{ ...bookTd, color: 'var(--positive)', position: 'relative' }}>
                  <span style={{ position: 'absolute', inset: 0, right: `${100 - (r.qty / maxBookQty) * 100}%`, background: 'var(--positive-soft)', zIndex: 0 }} />
                  <span style={{ position: 'relative' }}>{fmtRub(r.price)}</span>
                </td>
                <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-body)' }}>{r.qty.toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={bookTh}>Продажа</th><th style={{ ...bookTh, textAlign: 'right' }}>Лоты</th></tr></thead>
          <tbody>
            {book.asks.map((r, i) => (
              <tr key={i} onClick={() => fillPriceFromBook(r.price)} style={{ cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <td style={{ ...bookTd, color: 'var(--negative)', position: 'relative' }}>
                  <span style={{ position: 'absolute', inset: 0, right: `${100 - (r.qty / maxBookQty) * 100}%`, background: 'var(--negative-soft)', zIndex: 0 }} />
                  <span style={{ position: 'relative' }}>{fmtRub(r.price)}</span>
                </td>
                <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-body)' }}>{r.qty.toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ paddingTop: 'var(--sp-4)', font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
        Клик по цене — подставить в заявку · лот = {lotSize} шт
      </div>
    </Card>
  );

  const blocks = { watchlist: watchlistCard, chart: chartCard, order: orderCard, portfolio: portfolioContent, orderbook: orderbookCard };

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
          <TopBar wallet="Демо-счёт" address="MOEX ISS" searchPlaceholder="Поиск инструмента..." />
          <TickerStrip items={ticker} />
        </div>
        <main style={{ padding: 'var(--sp-7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--sp-4)', paddingBottom: 'var(--sp-6)', position: 'relative' }}>
            <Button variant="ghost" size="sm" icon="rotate-ccw" onClick={resetLayout}>Сбросить расположение</Button>
            <div style={{ position: 'relative' }}>
              <Button variant="secondary" size="sm" icon="plus" onClick={() => setAddMenuOpen(o => !o)}>Добавить виджет</Button>
              {addMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 40, minWidth: 220,
                  background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--shadow-popover)', padding: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {hiddenWidgetIds.length === 0 ? (
                    <span style={{ padding: '7px 10px', font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Все виджеты уже на экране</span>
                  ) : (
                    hiddenWidgetIds.map(id => (
                      <button key={id} type="button" onClick={() => { setVisible(id, true); setAddMenuOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '7px 10px', borderRadius: 'var(--r-sm)',
                          border: 'none', cursor: 'pointer', background: 'transparent', color: 'var(--text-body)', font: 'var(--type-body-sm)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                        <Icon name="plus" size={12} style={{ background: 'var(--text-faint)' }} />
                        {WIDGET_LABELS[id]}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <DraggableStack
            rows={rows}
            onReorder={setRows}
            blocks={blocks}
            sizes={sizes}
            defaultSizes={DEFAULT_WORKSPACE_HEIGHTS}
            onResize={setSize}
            hidden={Object.fromEntries(WIDGET_IDS.map(id => [id, !visible[id]]))}
            onRemove={id => toggleVisible(id)}
            gap="var(--sp-7)"
          />
        </main>
      </div>
    </div>
  );
}
