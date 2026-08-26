const { SidebarNav, TopBar, TickerStrip, Card, SectionHeader } = window.TerminalforDesignSystem_c51d59;

function Placeholder({ title }) {
  return (
    <div style={{ padding: 'var(--sp-9)' }}>
      <Card variant="panel" padding="var(--pad-panel)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
        <SectionHeader title={title} eyebrow="Not present in the source material" />
        <p style={{ margin: 0, font: 'var(--type-body-sm)', color: 'var(--text-faint)', maxWidth: 520 }}>
          The reference material only documents the Dashboard, the exchange panel and the market ledger. This view is
          intentionally left blank rather than invented — see readme.md.
        </p>
      </Card>
    </div>
  );
}

function App() {
  const data = window.TF_DATA;
  const [signedIn, setSignedIn] = React.useState(true);
  const [view, setView] = React.useState('dashboard');
  if (!signedIn) return <SignIn onSignIn={() => setSignedIn(true)} />;
  const crumbs = { dashboard: ['Overview', 'Dashboard'], portfolio: ['Account', 'Portfolio'], transactions: ['Activity', 'Transactions'] }[view] || ['Overview', view.charAt(0).toUpperCase() + view.slice(1)];
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <SidebarNav greeting={<>Welcome<br />Back, Jason</>} meta="Last login 15 Jun 2025" groups={data.navGroups}
        active={view} onSelect={setView} footer={
          <button type="button" onClick={() => setSignedIn(false)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', height: 36, width: '100%', padding: '0 var(--sp-5)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', font: 'var(--type-body-sm)', fontWeight: 'var(--fw-medium)' }}>Log out</button>
        } style={{ position: 'sticky', top: 0, height: '100vh' }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar crumbs={crumbs} wallet="Your Wallet" address="0x00FD...FAB6" />
        <TickerStrip items={data.tickers} />
        <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
          <main style={{ flex: 1, minWidth: 0 }}>
            {view === 'dashboard' && <Dashboard data={data} />}
            {view === 'portfolio' && <Portfolio data={data} />}
            {view === 'transactions' && <Transactions data={data} />}
            {!['dashboard', 'portfolio', 'transactions'].includes(view) && <Placeholder title={view.charAt(0).toUpperCase() + view.slice(1)} />}
          </main>
          {view === 'dashboard' && <ExchangePanel candles={data.candles} />}
        </div>
      </div>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
