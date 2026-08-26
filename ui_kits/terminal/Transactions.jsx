const { SectionHeader, Card, CoinMark, Badge, Button, FilterTabs, SearchInput, IconButton } = window.TerminalforDesignSystem_c51d59;

function Transactions({ data }) {
  const [tab, setTab] = React.useState('All');
  const list = tab === 'All' ? data.transactions : data.transactions.filter(t => t.kind === tab.replace(/s$/, ''));
  const th = { font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)', fontWeight: 'var(--fw-medium)', textAlign: 'left', padding: '0 var(--sp-6) var(--sp-6)' };
  const td = { padding: 'var(--sp-6)', borderTop: '1px solid var(--border-hairline)', whiteSpace: 'nowrap', font: 'var(--type-body-sm)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)', padding: 'var(--sp-9)' }}>
      <SectionHeader eyebrowIcon="clock" eyebrow="Last 30 days" size="lg" title="Transactions"
        actions={<><SearchInput width={220} placeholder="Search pair..." shortcut={null} /><Button variant="secondary" icon="download">Statement</Button></>} />
      <Card variant="panel" padding="var(--pad-panel)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-8)' }}>
          <FilterTabs options={['All', 'Buys', 'Sells', 'Swaps']} value={tab} onChange={setTab} />
          <IconButton icon="sliders-horizontal" size={30} label="Filter" />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>Type</th><th style={th}>Pair</th><th style={{ ...th, textAlign: 'right' }}>Amount</th>
            <th style={{ ...th, textAlign: 'right' }}>Total</th><th style={{ ...th, textAlign: 'right' }}>Time</th><th style={{ ...th, textAlign: 'right' }}>Status</th>
          </tr></thead>
          <tbody>
            {list.map((t, i) => (
              <tr key={i}>
                <td style={td}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: t.kind === 'Sell' ? 'var(--negative)' : t.kind === 'Buy' ? 'var(--positive)' : 'var(--text-accent)', fontWeight: 'var(--fw-semibold)' }}>{t.kind}</span>
                </td>
                <td style={td}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
                    <CoinMark symbol={t.symbol} size={22} />
                    <span style={{ fontWeight: 'var(--fw-semibold)' }}>{t.pair}</span>
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'right', font: 'var(--type-numeric-strong)', color: 'var(--text-body)' }}>{t.amount}</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 'var(--fw-semibold)', fontVariantNumeric: 'tabular-nums' }}>{t.total}</td>
                <td style={{ ...td, textAlign: 'right', font: 'var(--type-numeric)', color: 'var(--text-faint)' }}>{t.time}</td>
                <td style={{ ...td, textAlign: 'right' }}><Badge tone={t.status === 'Filled' ? 'positive' : 'warn'}>{t.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
Object.assign(window, { Transactions });
