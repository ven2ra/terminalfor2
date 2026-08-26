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
import { PriceChart } from '../PriceChart.jsx';
import { DraggableStack, useBlockOrder, useBlockSizes } from '../DraggableBlocks.jsx';
import { NAV_GROUPS } from '../nav.js';
import { fetchInstrument, fetchTrades, fetchOrderBook, fetchNews, fetchCandles } from '../api.js';

const BLOCK_ORDER_KEY = 'tf2_instrument_block_order_v1';
const DEFAULT_ORDER = ['chart', 'orderbook', 'trades', 'order', 'news'];
const DEFAULT_BLOCK_HEIGHTS = { chart: 500, orderbook: 360, trades: 400, order: 440, news: 360 };

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function Instrument() {
  const { market, board, symbol } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = React.useState(null);
  const [candles, setCandles] = React.useState([]);
  const [chartLoading, setChartLoading] = React.useState(true);
  const [trades, setTrades] = React.useState([]);
  const [book, setBook] = React.useState({ bids: [], asks: [] });
  const [news, setNews] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [order, setOrder] = useBlockOrder(BLOCK_ORDER_KEY, DEFAULT_ORDER);
  const [sizes, setSize] = useBlockSizes(BLOCK_ORDER_KEY);

  const [side, setSide] = React.useState('Купить');
  const [price, setPrice] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [submitted, setSubmitted] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      const [i, c, t, b, n] = await Promise.all([
        fetchInstrument(symbol, market, board),
        fetchCandles(symbol, market, board),
        fetchTrades(symbol, market, board),
        fetchOrderBook(symbol, market, board),
        fetchNews(symbol, market, board),
      ]);
      setInfo(i);
      setCandles(c.candles || []);
      setChartLoading(false);
      setTrades(t);
      setBook(b);
      setNews(n);
      setError(null);
      setPrice(p => (p ? p : i.priceRaw != null ? String(i.priceRaw) : ''));
    } catch (e) {
      setError(e.message);
    }
  }, [symbol, market, board]);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const total = (Number(price) || 0) * (Number(qty) || 0);

  const submitOrder = () => {
    setSubmitted({ side, price, qty, at: new Date() });
  };

  const th = { font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)', fontWeight: 'var(--fw-medium)', textAlign: 'left', padding: '0 var(--sp-4) var(--sp-4)' };
  const td = { padding: 'var(--sp-3) var(--sp-4)', font: 'var(--type-numeric)', fontVariantNumeric: 'tabular-nums' };

  const blocks = info && {
    chart: (
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--sp-7) var(--sp-7) 0' }}>
          <SectionHeader title="График" eyebrow="Реальные свечи MOEX · часовой таймфрейм" />
        </div>
        <div style={{ padding: 'var(--sp-6) var(--sp-5) var(--sp-3)' }}>
          <PriceChart candles={candles} loading={chartLoading} height={Math.max(240, (sizes.chart ?? DEFAULT_BLOCK_HEIGHTS.chart) - 100)} />
        </div>
      </Card>
    ),
    orderbook: (
      <Card>
        <SectionHeader title="Стакан заявок" eyebrow="Смоделировано вокруг текущей цены · демо" style={{ paddingBottom: 'var(--sp-6)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)' }}>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Покупка, ₽</th><th style={{ ...th, textAlign: 'right' }}>Кол-во</th></tr></thead>
              <tbody>
                {book.bids.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, color: 'var(--positive)' }}>{r.price.toLocaleString('ru-RU')}</td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--text-body)' }}>{r.qty.toLocaleString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Продажа, ₽</th><th style={{ ...th, textAlign: 'right' }}>Кол-во</th></tr></thead>
              <tbody>
                {book.asks.map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, color: 'var(--negative)' }}>{r.price.toLocaleString('ru-RU')}</td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--text-body)' }}>{r.qty.toLocaleString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    ),
    trades: (
      <Card>
        <SectionHeader title="Лента сделок" eyebrow="Реальные сделки MOEX" style={{ paddingBottom: 'var(--sp-6)' }} />
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Время</th><th style={{ ...th, textAlign: 'right' }}>Цена, ₽</th><th style={{ ...th, textAlign: 'right' }}>Кол-во</th></tr></thead>
            <tbody>
              {trades.map((t, i) => (
                <tr key={i}>
                  <td style={{ ...td, color: 'var(--text-faint)' }}>{t.time}</td>
                  <td style={{ ...td, textAlign: 'right', color: t.side === 'B' ? 'var(--positive)' : 'var(--negative)' }}>{t.price.toLocaleString('ru-RU')}</td>
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
        <SectionHeader title="Новая заявка" eyebrow="Демо-режим · заявки не отправляются на биржу" style={{ paddingBottom: 'var(--sp-7)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', maxWidth: 420 }}>
          <SegmentedControl options={['Купить', 'Продать']} value={side} onChange={setSide} />
          <AmountField label="Цена, ₽" value={price} onChange={e => setPrice(e.target.value)} currency="₽" />
          <AmountField label="Количество, шт" value={qty} onChange={e => setQty(e.target.value)} currency={info.lotSize > 1 ? `лот ${info.lotSize}` : 'шт'} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>Итого</span>
            <span style={{ font: 'var(--type-numeric-strong)', color: 'var(--text-primary)' }}>{total.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽</span>
          </div>
          <Button variant={side === 'Купить' ? 'primary' : 'danger'} size="lg" fullWidth onClick={submitOrder}>
            {side} {symbol}
          </Button>
          {submitted && (
            <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
              Демо-заявка «{submitted.side} {qty} × {symbol} по {submitted.price} ₽» создана в {submitted.at.toLocaleTimeString('ru-RU')} — реальная торговля не выполняется.
            </span>
          )}
        </div>
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
            crumbs={['Дашборд', symbol]}
            wallet="Демо-счёт"
            address="MOEX ISS"
            searchPlaceholder="Поиск инструмента..."
          />
        </div>
        <main style={{ padding: 'var(--sp-9)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)' }}>
            <IconButton icon="chevron-left" size={34} label="Назад к дашборду" onClick={() => navigate('/')} />
            <Link to="/" style={{ font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>Дашборд</Link>
            <span style={{ color: 'var(--n-500)' }}>/</span>
            <span style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', color: 'var(--text-primary)' }}>{symbol}</span>
          </div>

          {error && <Card style={{ color: 'var(--negative)' }}>Ошибка загрузки: {error}</Card>}

          {info && (
            <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-7)' }}>
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
            </Card>
          )}

          {blocks && (
            <DraggableStack
              order={order}
              onReorder={setOrder}
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
