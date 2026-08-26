import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarNav } from '../../components/navigation/SidebarNav.jsx';
import { TopBar } from '../../components/navigation/TopBar.jsx';
import { TickerStrip } from '../../components/data/TickerStrip.jsx';
import { Card } from '../../components/core/Card.jsx';
import { SectionHeader } from '../../components/core/SectionHeader.jsx';
import { MarketTable } from '../../components/data/MarketTable.jsx';
import { AssetCard } from '../../components/data/AssetCard.jsx';
import { fetchSecurities, fetchFeatured } from '../api.js';
import { NAV_GROUPS } from '../nav.js';

export function Dashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = React.useState([]);
  const [featured, setFeatured] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [updatedAt, setUpdatedAt] = React.useState(null);

  const load = React.useCallback(async () => {
    try {
      const [securities, live] = await Promise.all([fetchSecurities(), fetchFeatured()]);
      setRows(securities);
      setFeatured(live);
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
  const goToInstrument = r => navigate(`/instrument/${r.market || 'shares'}/${r.board || 'TQBR'}/${r.symbol}`);

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
            crumbs={['Дашборд']}
            wallet="Демо-счёт"
            address="MOEX ISS"
            searchPlaceholder="Поиск инструмента..."
          />
          <TickerStrip items={ticker} />
        </div>
        <main style={{ padding: 'var(--sp-9)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-9)' }}>
          <section>
            <div style={{ paddingBottom: 'var(--sp-7)' }}>
              <SectionHeader
                title="Живые обновления"
                live={!error}
                eyebrow={error ? `Ошибка загрузки: ${error}` : 'Котировки в реальном времени'}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-7)' }}>
              {featured.map(f => (
                <AssetCard
                  key={f.symbol}
                  symbol={f.symbol}
                  name={f.name}
                  pair={`${f.symbol} · ${f.kind}`}
                  price={f.priceRaw}
                  delta={f.deltaRaw}
                  series={f.series && f.series.length ? f.series : [f.priceRaw, f.priceRaw]}
                  currency={f.kind === 'Облигация' ? '' : '₽'}
                  suffix={f.kind === 'Облигация' ? '%' : undefined}
                  priceLabel="Цена"
                  menuLabel={`${f.name} · действия`}
                  onClick={() => goToInstrument(f)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </section>

          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: 'var(--sp-7) var(--sp-7) 0' }}>
              <SectionHeader
                title="Обзор рынка"
                live={!error}
                eyebrow={
                  error
                    ? `Ошибка загрузки: ${error}`
                    : updatedAt
                      ? `Обновлено ${updatedAt.toLocaleTimeString('ru-RU')}`
                      : 'Загрузка…'
                }
              />
            </div>
            <div style={{ overflowX: 'auto', padding: 'var(--sp-4) var(--sp-3) var(--sp-6)' }}>
              <MarketTable
                rows={rows}
                deltaLabels={['Изм. %']}
                rankLabel="№"
                nameLabel="Инструмент"
                priceLabel="Цена, ₽"
                marketCapLabel="Оборот, ₽"
                volumeLabel="Объём, шт"
                chartLabel="График"
                onRowClick={goToInstrument}
              />
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}
