const { SectionHeader, Card, PriceValue, DeltaChip, CoinMark, Sparkline, Button, SelectMenu, IconButton } = window.TerminalforDesignSystem_c51d59;

function Portfolio({ data }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)', padding: 'var(--sp-9)' }}>
      <SectionHeader live eyebrow="Synced 40 seconds ago" size="lg" title="Portfolio"
        actions={<><SelectMenu options={['All wallets', 'Cold storage']} value="All wallets" /><Button variant="secondary" icon="download">Export</Button></>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 'var(--gap-card)' }}>
        <Card glow="accent" padding="var(--pad-panel)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>Total balance</span>
          <PriceValue value="169,196.56" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
            <DeltaChip value={3.42} showIcon /><span style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>+$5,589.10 today</span>
          </div>
          <Sparkline points={data.rows[2].series} tone="accent" height={54} style={{ marginInline: -20, marginBottom: -20 }} />
        </Card>
        {[['Realised P&L', '12,480.22', 8.14], ['Unrealised P&L', '-3,102.68', -2.66]].map(([l, v, d]) => (
          <Card key={l} padding="var(--pad-panel)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>{l}</span>
            <PriceValue value={v} size="md" />
            <DeltaChip value={d} showIcon style={{ alignSelf: 'flex-start' }} />
          </Card>
        ))}
      </div>
      <Card variant="panel" padding="var(--pad-panel)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
        <SectionHeader title="Holdings" eyebrow="4 assets" actions={<IconButton icon="ellipsis-vertical" size={28} label="Holdings actions" />} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {data.holdings.map(h => (
            <div key={h.symbol} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.4fr 90px', alignItems: 'center', gap: 'var(--sp-8)', padding: 'var(--sp-6) 0', borderTop: '1px solid var(--border-hairline)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                <CoinMark symbol={h.symbol} size={26} ring />
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)' }}>{h.name}</span>
                  <span style={{ font: 'var(--type-numeric)', color: 'var(--text-faint)' }}>{h.amount}</span>
                </span>
              </span>
              <span style={{ font: 'var(--type-body-sm)', fontWeight: 'var(--fw-semibold)', fontVariantNumeric: 'tabular-nums' }}>{h.value}</span>
              <DeltaChip value={h.delta} size="sm" />
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                <span style={{ flex: 1, height: 4, borderRadius: 'var(--r-pill)', background: 'var(--surface-raised)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', width: h.alloc + '%', height: '100%', background: 'linear-gradient(90deg,#2a2472,#8b7bff)' }} />
                </span>
                <span style={{ font: 'var(--type-numeric-strong)', color: 'var(--text-muted)' }}>{h.alloc}%</span>
              </span>
              <Sparkline points={data.rows[0].series} tone={h.delta >= 0 ? 'up' : 'down'} height={28} width={90} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
Object.assign(window, { Portfolio });
