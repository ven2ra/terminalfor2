import React from 'react';
import { SidebarNav } from '../components/navigation/SidebarNav.jsx';
import { TopBar } from '../components/navigation/TopBar.jsx';
import { TickerStrip } from '../components/data/TickerStrip.jsx';
import { Card } from '../components/core/Card.jsx';
import { SectionHeader } from '../components/core/SectionHeader.jsx';
import { MarketTable } from '../components/data/MarketTable.jsx';
import { fetchSecurities } from './api.js';

const NAV_GROUPS = [
  {
    label: 'Terminal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-grid' },
      { id: 'market', label: 'Market Trends', icon: 'trending-up' },
      { id: 'portfolio', label: 'Portfolio', icon: 'candlestick-chart' },
      { id: 'watchlist', label: 'Watchlist', icon: 'star' },
    ],
  },
  {
    label: 'Account',
    items: [{ id: 'settings', label: 'Settings', icon: 'settings' }],
  },
];

export function App() {
  const [rows, setRows] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [updatedAt, setUpdatedAt] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      const data = await fetchSecurities();
      setRows(data);
      setUpdatedAt(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  React.useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const ticker = rows.slice(0, 10).map(r => ({ symbol: r.symbol, price: r.price, quote: 'RUB' }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <SidebarNav
        greeting="Terminalfor"
        meta="MOEX · Акции TQBR"
        groups={NAV_GROUPS}
        active="dashboard"
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar crumbs={['Dashboard']} wallet="Demo Account" address="MOEX ISS" />
        <TickerStrip items={ticker} />
        <main style={{ flex: 1, padding: 'var(--sp-9)', overflow: 'auto' }}>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--sp-7) var(--sp-7) 0' }}>
              <SectionHeader
                title="Market Overview"
                live={!error}
                eyebrow={
                  error
                    ? `Ошибка загрузки: ${error}`
                    : updatedAt
                      ? `Last update ${updatedAt.toLocaleTimeString('ru-RU')}`
                      : 'Загрузка…'
                }
              />
            </div>
            <div style={{ overflowX: 'auto', padding: 'var(--sp-4) var(--sp-3) var(--sp-6)' }}>
              <MarketTable rows={rows} deltaLabels={['Изм. %']} />
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
