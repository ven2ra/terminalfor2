const { SectionHeader, Button, SelectMenu, FilterTabs, AssetCard, MarketTable, Card } = window.TerminalforDesignSystem_c51d59;

function Dashboard({ data }) {
  const [tab, setTab] = React.useState('All');
  const [cur, setCur] = React.useState('USDT');
  const rows = tab === 'Top Gainers' ? data.rows.filter(r => r.deltas[1] >= 0)
    : tab === 'Top Losers' ? data.rows.filter(r => r.deltas[1] < 0) : data.rows;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)', padding: 'var(--sp-9)' }}>
      <SectionHeader live eyebrow={<>Last update <b style={{ color: 'var(--text-body)' }}>2 min ago</b></>} size="lg" title="Live Crypto Updates"
        actions={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--sp-5)' }}>
            <Button variant="ghost" trailingIcon="chevron-right">See all</Button>
            <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
              <SelectMenu options={['USDT', 'USDC', 'ETH']} value={cur} onChange={setCur} />
              <SelectMenu options={['Top Gainers', 'Top Losers']} value="Top Gainers" />
              <SelectMenu options={['24H', '7D', '30D']} value="7D" />
            </div>
          </div>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--gap-card)' }}>
        {data.cards.map(c => <AssetCard key={c.symbol} {...c} />)}
      </div>
      <Card variant="panel" padding="var(--pad-panel)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
        <SectionHeader eyebrowIcon="clock" eyebrow="Live Updates" title="Market Overview"
          actions={<>
            <FilterTabs options={['All', 'Trends', 'Favorites', 'Top Gainers', 'Top Losers']} value={tab} onChange={setTab} />
            <Button variant="ghost" trailingIcon="chevron-right">See all</Button>
          </>} />
        <MarketTable rows={rows} />
      </Card>
    </div>
  );
}
Object.assign(window, { Dashboard });
