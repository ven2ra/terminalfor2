import React from 'react';
import { TopBar } from '../../components/navigation/TopBar.jsx';
import { TickerStrip } from '../../components/data/TickerStrip.jsx';
import { Card } from '../../components/core/Card.jsx';
import { Button } from '../../components/core/Button.jsx';
import { SectionHeader } from '../../components/core/SectionHeader.jsx';
import { Badge } from '../../components/core/Badge.jsx';
import { DeltaChip } from '../../components/core/DeltaChip.jsx';
import { PriceValue } from '../../components/data/PriceValue.jsx';
import { CoinMark } from '../../components/data/CoinMark.jsx';
import { SegmentedControl } from '../../components/forms/SegmentedControl.jsx';
import { SelectMenu } from '../../components/forms/SelectMenu.jsx';
import { AmountField } from '../../components/forms/AmountField.jsx';
import { FilterTabs } from '../../components/forms/FilterTabs.jsx';
import { SearchInput } from '../../components/forms/SearchInput.jsx';
import { PriceChart } from '../PriceChart.jsx';
import { fetchSecurities, fetchInstrument, fetchCandles, fetchOrderBook, fetchBondEvents, fetchKeyRate } from '../api.js';
import { Icon } from '../../components/core/Icon.jsx';
import { FreeCanvas, useBlockLayout, useWidgetVisibility } from '../DraggableBlocks.jsx';
import { useDemoAccount, placeOrder, cancelOrder, checkPendingOrders, commissionRate, orderNotional, unitCost } from '../demoAccount.js';
import { useTheme, toggleTheme } from '../theme.js';
import { useMarketOpen, marketScheduleLabel, useSessionPhase, SESSION_PHASE_LABELS } from '../marketHours.js';

const ORDER_TYPES = ['Рыночная', 'Лимитная', 'Стоп-лимит', 'Стоп-маркет'];
const TIMEFRAMES = [
  { code: '1m', label: '1м' }, { code: '5m', label: '5м' }, { code: '15m', label: '15м' },
  { code: '1h', label: '1ч' }, { code: '4h', label: '4ч' }, { code: '1d', label: '1д' },
];

const WORKSPACE_KEY = 'tf2_dash_workspace_v4';
const WIDGET_IDS = ['watchlist', 'chart', 'order', 'activeOrders', 'portfolio', 'orderbook', 'bondEvents', 'margin'];
const WIDGET_LABELS = {
  watchlist: 'Инструменты', chart: 'График', order: 'Новая заявка', activeOrders: 'Активные заявки', portfolio: 'Портфель',
  orderbook: 'Стакан заявок', bondEvents: 'Оферты и купоны', margin: 'Маржинальная торговля',
};
// { xPct, y, wPct, h } — x/width as a % of the canvas, y/height in px.
const DEFAULT_LAYOUT = {
  watchlist: { xPct: 0, y: 0, wPct: 21, h: 700 },
  chart: { xPct: 22, y: 0, wPct: 44, h: 460 },
  order: { xPct: 67, y: 0, wPct: 32, h: 460 },
  activeOrders: { xPct: 67, y: 480, wPct: 32, h: 260 },
  portfolio: { xPct: 22, y: 480, wPct: 44, h: 300 },
  orderbook: { xPct: 67, y: 760, wPct: 32, h: 420 },
  bondEvents: { xPct: 22, y: 800, wPct: 44, h: 320 },
  margin: { xPct: 67, y: 1200, wPct: 32, h: 280 },
};

// A negative cash balance means the account borrowed to buy — the margin
// spread MOEX-style brokers charge on top of the key rate for that loan.
const MARGIN_SPREAD_PCT = 6.9;

function fmtRub(n, opts) {
  return Number(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2, ...opts });
}

// Bonds quote as a percentage of face value on MOEX, never in currency —
// every price/order-book/ticker display keys its unit off this instead of
// hardcoding ₽, so a bond reads "%", and everything else keeps "₽".
function priceUnit(market) {
  return market === 'bonds' ? '%' : '₽';
}

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  } catch {
    return iso;
  }
}

function mergeCandles(existing, incoming) {
  if (!incoming.length) return existing;
  const map = new Map(existing.map(c => [c.t, c]));
  for (const c of incoming) map.set(c.t, c);
  return Array.from(map.values()).sort((a, b) => a.t.localeCompare(b.t));
}

// Flags a brief 'up'/'down' pulse whenever a numeric value ticks — drives the
// green/red price-flash background on the active instrument's price. `token`
// changes on every new flash so a CSS animation keyed on it always restarts
// from full intensity instead of a transition re-fading from wherever the
// previous one left off.
function usePriceFlash(value) {
  const [flash, setFlash] = React.useState(null);
  const prevRef = React.useRef(value);
  const tokenRef = React.useRef(0);

  React.useEffect(() => {
    const prev = prevRef.current;
    if (prev != null && value != null && value !== prev) {
      tokenRef.current += 1;
      setFlash({ dir: value > prev ? 'up' : 'down', token: tokenRef.current });
    }
    prevRef.current = value;
  }, [value]);

  React.useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  return flash;
}

export function Dashboard() {
  const account = useDemoAccount();
  const theme = useTheme();
  const marketOpen = useMarketOpen();
  const sessionPhase = useSessionPhase();

  const [watchlist, setWatchlist] = React.useState([]);
  const [watchlistError, setWatchlistError] = React.useState(null);
  const [watchlistQuery, setWatchlistQuery] = React.useState('');
  const [assetClass, setAssetClass] = React.useState('shares'); // 'shares' | 'bonds' — which market the instrument list shows
  const [active, setActive] = React.useState(null); // { symbol, market, board, name }
  const [extraQuotes, setExtraQuotes] = React.useState({});
  const [bondEvents, setBondEvents] = React.useState({ coupons: [], offers: [] });
  const [keyRate, setKeyRate] = React.useState(null);

  // The CBR key rate changes only a handful of times a year — poll it far
  // less aggressively than the market data.
  React.useEffect(() => {
    let cancelled = false;
    const load = () => fetchKeyRate().then(r => { if (!cancelled) setKeyRate(r.rate); }).catch(() => {});
    load();
    const id = setInterval(load, 10 * 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

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

  const [layout, updateBlock, resetLayoutOnly] = useBlockLayout(WORKSPACE_KEY, DEFAULT_LAYOUT);
  const [visible, toggleVisible, setVisible, resetVisible] = useWidgetVisibility(WORKSPACE_KEY, WIDGET_IDS);
  const [addMenuOpen, setAddMenuOpen] = React.useState(false);

  const resetLayout = () => {
    resetLayoutOnly();
    resetVisible();
  };
  const hiddenWidgetIds = WIDGET_IDS.filter(id => !visible[id]);

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
  // The instrument list only ever holds one asset class at a time (whichever
  // the "Акции/Облигации" tab shows) — the active instrument can easily be
  // the other one, or simply outside the top-30 the list is capped to. Fall
  // back to the dedicated per-symbol fetch (`info`) so the price/name/delta
  // shown everywhere doesn't just go blank in that case.
  const activeQuote = active
    ? getQuote(active.symbol) || (info && info.symbol === active.symbol ? info : null)
    : null;
  const priceFlash = usePriceFlash(activeQuote?.priceRaw);

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
    setBondEvents({ coupons: [], offers: [] });
  }, [active?.symbol, active?.market, active?.board]);

  // Everything the visible UI shows a price for — the ticker, the
  // instrument list, the chart header and the order form — is fetched in
  // one shared tick so they can never drift apart from each other by
  // however long a per-widget poll interval happened to be offset by.
  const loadAll = React.useCallback(async () => {
    try {
      const tasks = [fetchSecurities(assetClass)];
      if (active) {
        tasks.push(
          fetchInstrument(active.symbol, active.market, active.board),
          fetchCandles(active.symbol, active.market, active.board, tf),
          fetchOrderBook(active.symbol, active.market, active.board),
        );
      }
      const [securities, instrumentInfo, candlesResp, bookResp] = await Promise.all(tasks);

      setWatchlist(securities);
      setWatchlistError(null);
      setActive(prev => prev || (securities[0] ? { symbol: securities[0].symbol, market: securities[0].market, board: securities[0].board, name: securities[0].name } : null));

      // The coupon/offer schedule only applies to bonds — skip the extra
      // MOEX round-trip entirely for a share instead of fetching an always-
      // empty result.
      if (active?.market === 'bonds') {
        fetchBondEvents(active.symbol)
          .then(setBondEvents)
          .catch(() => {});
      }

      if (active) {
        setInfo(instrumentInfo);
        setPrice(p => (p ? p : instrumentInfo.priceRaw != null ? String(instrumentInfo.priceRaw) : ''));

        // MOEX's own candles.json lags the instant last-trade price by up to
        // a full bar (on 1m it can sit a whole minute behind, since a bar
        // only reflects trades already bucketed into it) — that's what
        // showed up as the chart's price line trailing the header number.
        // Patch the live price straight onto the last (still-forming) bar so
        // the chart always agrees with the same number everything else shows.
        const livePrice = instrumentInfo.priceRaw;
        setCandles(prev => {
          let merged = mergeCandles(prev, candlesResp.candles || []);
          if (livePrice != null && merged.length) {
            const last = merged[merged.length - 1];
            merged = [...merged.slice(0, -1), { ...last, c: livePrice, h: Math.max(last.h, livePrice), l: Math.min(last.l, livePrice) }];
          }
          return merged;
        });
        setChartLoading(false);
        setBook(bookResp);
        if (livePrice != null) checkPendingOrders(active.symbol, livePrice);
      }
    } catch (e) {
      setWatchlistError(e.message);
    }
  }, [active?.symbol, active?.market, active?.board, tf, assetClass]);

  // One fetch always runs (so a page opened outside trading hours still
  // shows the market's last real values instead of nothing) — but the
  // repeating poll only starts while the market is open. Closed, nothing
  // refetches: quotes, the order book, and the chart just sit at whatever
  // they last showed, with no further price-flash or volume movement.
  React.useEffect(() => {
    loadAll();
    if (!marketOpen) return;
    const id = setInterval(loadAll, 2000);
    return () => clearInterval(id);
  }, [loadAll, marketOpen]);

  const ticker = watchlist.slice(0, 10).map(r => ({ symbol: r.symbol, price: r.price, quote: r.market === 'bonds' ? '%' : null }));
  const selectInstrument = r => setActive({ symbol: r.symbol, market: r.market, board: r.board, name: r.name });

  const lotSize = info?.lotSize || 1;
  const minStep = info?.minStep || 0;
  const isBondActive = active?.market === 'bonds';
  const faceValue = info?.faceValue || 0;
  const accruedInterest = info?.accruedInterest || 0;
  const isMarket = orderType === 'Рыночная';
  const needsStop = orderType === 'Стоп-лимит' || orderType === 'Стоп-маркет';
  const effectivePrice = isMarket ? activeQuote?.priceRaw || 0 : Number(price) || 0;
  const qtyNum = Number(qty) || 0;
  const notional = orderNotional({ isBond: isBondActive, price: effectivePrice, qty: qtyNum, lotSize, faceValue, accruedInterest });
  const nkdAmount = isBondActive ? accruedInterest * qtyNum * lotSize : 0;
  const commission = notional * commissionRate();
  const totalCost = notional + commission;
  const position = active && account.positions[active.symbol];
  const fillPriceFromBook = p => { setOrderType('Лимитная'); setPrice(String(p)); };

  const setQtyFromPercent = pct => {
    if (side === 'Продать') {
      const held = position?.qty || 0;
      setQty(String(Math.max(1, Math.floor((held * pct) / 100))));
      return;
    }
    const refPrice = isMarket ? activeQuote?.priceRaw || 0 : Number(price) || activeQuote?.priceRaw || 0;
    if (!refPrice) return;
    const budget = (account.cash * pct) / 100;
    const perLot = unitCost({ isBond: isBondActive, price: refPrice, faceValue }) * lotSize + (isBondActive ? accruedInterest * lotSize : 0);
    if (!perLot) return;
    setQty(String(Math.max(1, Math.floor(budget / perLot))));
  };

  // MOEX quotes in discrete price-tick increments (MINSTEP) — round whatever
  // the user typed to the nearest tick before it can reach the order.
  const roundToTick = v => {
    if (!minStep) return v;
    return Math.round(v / minStep) * minStep;
  };

  const submitOrder = () => {
    if (!active) return;
    const limitPrice = roundToTick(Number(price) || 0);
    const result = placeOrder({
      symbol: active.symbol, market: active.market, board: active.board, name: activeQuote?.name || info?.name || active.name,
      side, type: orderType, qty: qtyNum, price: limitPrice, stopPrice: Number(stopPrice) || 0, lastPrice: activeQuote?.priceRaw || 0,
      lotSize, isBond: isBondActive, faceValue, accruedInterest,
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
          live={!watchlistError && marketOpen}
          eyebrow={watchlistError ? `Ошибка: ${watchlistError}` : marketOpen ? 'Топ по обороту' : 'Торги закрыты · последние цены сессии'}
        />
        <FilterTabs
          options={['Акции', 'Облигации']}
          value={assetClass === 'bonds' ? 'Облигации' : 'Акции'}
          onChange={v => setAssetClass(v === 'Облигации' ? 'bonds' : 'shares')}
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
                  <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-primary)' }}>{r.price} {priceUnit(r.market)}</td>
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
            {active ? `${active.symbol} · ${activeQuote?.name || info?.name || active.name || ''}` : 'Выберите инструмент'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--sp-5)' }}>
            <span
              key={priceFlash?.token || 'idle'}
              style={{
                display: 'inline-block', borderRadius: 'var(--r-md)', padding: '2px var(--sp-4)', margin: '-2px calc(var(--sp-4) * -1)',
                animation: priceFlash ? `${priceFlash.dir === 'up' ? 'tf2PriceFlashUp' : 'tf2PriceFlashDown'} 700ms ease-out` : 'none',
              }}
            >
              <PriceValue value={activeQuote?.priceRaw} currency="" suffix={priceUnit(active?.market)} size="lg" />
            </span>
            {activeQuote && <DeltaChip value={activeQuote.deltaRaw} showIcon />}
            <Badge tone={marketOpen ? 'positive' : 'neutral'}>{SESSION_PHASE_LABELS[sessionPhase]}</Badge>
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
          height={Math.max(220, (layout.chart?.h ?? DEFAULT_LAYOUT.chart.h) - 150)}
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
      const lot = pos.lotSize || 1;
      const units = pos.qty * lot;
      // A bond position's real ruble value is % of face value × units, plus
      // whatever accrued coupon interest (НКД) has built up since the last
      // coupon — shown separately, since it isn't part of the bond's own
      // market-price P&L.
      const unitValue = pos.isBond ? (last / 100) * (pos.faceValue || 0) : last;
      const avgUnitValue = pos.isBond ? (pos.avgPrice / 100) * (pos.faceValue || 0) : pos.avgPrice;
      const nkd = pos.isBond ? (q?.accruedInterest || 0) * units : 0;
      const value = unitValue * units;
      const pnl = (unitValue - avgUnitValue) * units;
      const pnlPct = avgUnitValue ? ((unitValue - avgUnitValue) / avgUnitValue) * 100 : 0;
      return { sym, pos, last, value, pnl, pnlPct, nkd };
    });
    const totalValue = account.cash + priced.reduce((s, p) => s + p.value + p.nkd, 0);
    const totalPnl = priced.reduce((s, p) => s + p.pnl, 0);
    const costBasis = priced.reduce((s, p) => s + (p.pos.isBond ? (p.pos.avgPrice / 100) * (p.pos.faceValue || 0) : p.pos.avgPrice) * p.pos.qty * (p.pos.lotSize || 1), 0);
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
                <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>{p.pos.qty} лот · сред. {fmtRub(p.pos.avgPrice)} {priceUnit(p.pos.market)}</div>
                {p.pos.isBond && <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>НКД: {fmtRub(p.nkd)} ₽</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{fmtRub(p.value + p.nkd, { maximumFractionDigits: 0 })} ₽</div>
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
            <div>
              <AmountField label={needsStop ? `Цена исполнения, ${priceUnit(active.market)}` : `Цена, ${priceUnit(active.market)}`} value={price} onChange={e => setPrice(e.target.value)} currency={priceUnit(active.market)} />
              {minStep > 0 && <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>Шаг цены: {minStep}</span>}
            </div>
          )}
          {needsStop && <AmountField label={`Стоп-цена, ${priceUnit(active.market)}`} value={stopPrice} onChange={e => setStopPrice(e.target.value)} currency={priceUnit(active.market)} />}
          <AmountField label="Количество, лоты" value={qty} onChange={e => setQty(e.target.value)} currency={`лот ${lotSize}`} />
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            {[10, 25, 50, 100].map(pct => (
              <Button key={pct} variant="secondary" size="sm" style={{ flex: '1 1 60px' }} onClick={() => setQtyFromPercent(pct)}>{pct}%</Button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 'var(--sp-5)', background: 'var(--surface-inset)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}><span>Сумма</span><span>{fmtRub(notional - nkdAmount)} ₽</span></div>
            {isBondActive && (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}><span>НКД</span><span>{fmtRub(nkdAmount)} ₽</span></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}><span>Комиссия демо-брокера ({(commissionRate() * 100).toFixed(2)}%, не биржевой сбор)</span><span>{fmtRub(commission)} ₽</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, font: 'var(--type-numeric-strong)', color: 'var(--text-primary)', paddingTop: 4, borderTop: '1px solid var(--border-hairline)' }}><span>Итого</span><span>{fmtRub(totalCost)} ₽</span></div>
          </div>
          {!marketOpen && (
            <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
              Торги закрыты — заявки недоступны вне сессии {marketScheduleLabel()}
            </span>
          )}
          <Button variant={side === 'Купить' ? 'primary' : 'danger'} size="lg" fullWidth disabled={!marketOpen} onClick={submitOrder}>{side} {active.symbol}</Button>
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

  const bestBid = book.bids[0]?.price;
  const bestAsk = book.asks[0]?.price;
  const spread = bestBid != null && bestAsk != null ? bestAsk - bestBid : null;
  const spreadPct = spread != null && bestBid ? (spread / bestBid) * 100 : null;

  const orderbookCard = (
    <Card style={{ height: '100%', overflow: 'auto' }}>
      <SectionHeader
        title="Стакан заявок"
        size="sm"
        live={marketOpen && book.source === 'tinvest'}
        eyebrow={
          !marketOpen
            ? `Торги закрыты · сессия ${marketScheduleLabel()}`
            : book.source === 'tinvest' ? 'Реальный стакан · Т-Инвестиции' : 'Смоделировано · демо'
        }
        actions={!marketOpen && <Badge tone="neutral">Закрыто</Badge>}
        style={{ paddingBottom: 'var(--sp-4)' }}
      />
      {spread != null && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--sp-3) var(--sp-4)',
          marginBottom: 'var(--sp-4)', background: 'var(--surface-inset)', borderRadius: 'var(--r-md)',
          font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)',
        }}>
          <span>Спред</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 'var(--fw-semibold)' }}>
            {fmtRub(spread)} {priceUnit(active?.market)} ({spreadPct != null ? spreadPct.toFixed(2) : '—'}%)
          </span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--sp-5)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={bookTh}>Покупка, {priceUnit(active?.market)}</th><th style={{ ...bookTh, textAlign: 'right' }}>Лоты</th></tr></thead>
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
          <thead><tr><th style={bookTh}>Продажа, {priceUnit(active?.market)}</th><th style={{ ...bookTh, textAlign: 'right' }}>Лоты</th></tr></thead>
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

  const isBond = active?.market === 'bonds';
  const bondEventsCard = (
    <Card style={{ height: '100%', overflow: 'auto' }}>
      <SectionHeader
        title="Оферты и купоны"
        size="sm"
        eyebrow={isBond ? 'MOEX ISS · график выплат' : 'Доступно для облигаций'}
        style={{ paddingBottom: 'var(--sp-6)' }}
      />
      {!isBond ? (
        <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>
          {active ? 'Выбранный инструмент — не облигация' : 'Выберите облигацию слева'}
        </span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <div>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)', paddingBottom: 'var(--sp-3)' }}>Ближайшие купоны</div>
            {bondEvents.coupons.length === 0 ? (
              <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Нет данных о будущих купонах</span>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={bookTh}>Дата</th><th style={{ ...bookTh, textAlign: 'right' }}>Размер</th><th style={{ ...bookTh, textAlign: 'right' }}>Ставка</th></tr></thead>
                <tbody>
                  {bondEvents.coupons.map((c, i) => (
                    <tr key={i}>
                      <td style={{ ...bookTd, color: 'var(--text-body)' }}>{fmtDate(c.date)}</td>
                      <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-primary)' }}>{c.value != null ? `${fmtRub(c.value)} ${c.faceUnit}` : '—'}</td>
                      <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-faint)' }}>{c.rate != null ? `${c.rate}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)', paddingBottom: 'var(--sp-3)' }}>Оферты</div>
            {bondEvents.offers.length === 0 ? (
              <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Оферты не предусмотрены</span>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={bookTh}>Дата</th><th style={bookTh}>Тип</th><th style={{ ...bookTh, textAlign: 'right' }}>Цена выкупа</th></tr></thead>
                <tbody>
                  {bondEvents.offers.map((o, i) => (
                    <tr key={i}>
                      <td style={{ ...bookTd, color: 'var(--text-body)' }}>{fmtDate(o.date)}</td>
                      <td style={{ ...bookTd, color: 'var(--text-faint)' }}>{o.type}</td>
                      <td style={{ ...bookTd, textAlign: 'right', color: 'var(--text-primary)' }}>{o.price != null ? `${o.price}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Card>
  );

  const debt = account.cash < 0 ? -account.cash : 0;
  const totalRatePct = keyRate != null ? keyRate + MARGIN_SPREAD_PCT : null;
  const dailyMarginFee = debt > 0 && totalRatePct != null ? (debt * (totalRatePct / 100)) / 365 : 0;

  const marginCard = (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
      <SectionHeader title="Маржинальная торговля" size="sm" eyebrow="Ключевая ставка ЦБ РФ · обновляется автоматически" />
      {debt <= 0 ? (
        <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Маржинальный займ не используется</span>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--sp-6)' }}>
          <div>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Сумма долга</div>
            <PriceValue value={debt} currency="₽" size="sm" />
          </div>
          <div>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Ключевая ставка ЦБ</div>
            <div style={{ font: 'var(--type-h3)', color: 'var(--text-primary)' }}>{keyRate != null ? `${keyRate}%` : '—'}</div>
          </div>
          <div>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Итоговая ставка (КС + {MARGIN_SPREAD_PCT}%)</div>
            <div style={{ font: 'var(--type-h3)', color: 'var(--text-primary)' }}>{totalRatePct != null ? `${totalRatePct.toFixed(2)}%` : '—'}</div>
          </div>
          <div>
            <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>Комиссия за день</div>
            <div style={{ font: 'var(--type-h3)', color: 'var(--negative)' }}>{fmtRub(dailyMarginFee)} ₽</div>
          </div>
        </div>
      )}
    </Card>
  );

  const activeOrdersCard = (
    <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', overflow: 'auto' }}>
      <SectionHeader title="Активные заявки" size="sm" eyebrow={`${account.orders.length} в очереди`} />
      {!account.orders.length ? (
        <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Нет активных заявок</span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {account.orders.map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-3) 0', borderTop: '1px solid var(--border-hairline)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{o.side} {o.symbol} · {o.type}</div>
                <div style={{ font: 'var(--type-eyebrow)', color: 'var(--text-faint)' }}>
                  {o.qty} лот{o.price != null ? ` · ${o.price} ${priceUnit(o.market)}` : ''}{o.stopPrice != null ? ` · стоп ${o.stopPrice}` : ''}
                </div>
              </div>
              <Button variant="ghost" size="sm" icon="x" onClick={() => cancelOrder(o.id)}>Отменить</Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  const blocks = { watchlist: watchlistCard, chart: chartCard, order: orderCard, activeOrders: activeOrdersCard, portfolio: portfolioContent, orderbook: orderbookCard, bondEvents: bondEventsCard, margin: marginCard };

  return (
    <div style={{ background: 'var(--bg-app)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: 'var(--bg-app)' }}>
        <div style={{ padding: 'var(--sp-5) var(--sp-9) 0' }}>
          <span style={{ font: 'var(--type-h3)', fontSize: 'var(--fs-base)', letterSpacing: 'var(--ls-heading)', color: 'var(--text-primary)' }}>Terminalfor</span>
        </div>
        <TopBar
            wallet="Демо-счёт"
            address="MOEX ISS"
            searchPlaceholder="Поиск инструмента..."
            theme={theme}
            onToggleTheme={toggleTheme}
          />
          <TickerStrip items={ticker} />
          {!marketOpen && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', padding: 'var(--sp-3) var(--sp-9)',
              background: 'var(--neutral-soft)', borderBottom: '1px solid var(--border-hairline)',
              font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)',
            }}>
              <Icon name="moon" size={12} />
              {SESSION_PHASE_LABELS[sessionPhase]} · биржа работает {marketScheduleLabel()} · котировки и стакан заморожены на последних значениях
            </div>
          )}
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
          <FreeCanvas
            layout={layout}
            onUpdate={updateBlock}
            blocks={blocks}
            hidden={Object.fromEntries(WIDGET_IDS.map(id => [id, !visible[id]]))}
            onRemove={id => toggleVisible(id)}
          />
        </main>
    </div>
  );
}
