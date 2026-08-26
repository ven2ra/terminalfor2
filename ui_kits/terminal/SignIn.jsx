const { Card, Button, Badge, Icon, CoinMark } = window.TerminalforDesignSystem_c51d59;

function SignIn({ onSignIn }) {
  const [addr, setAddr] = React.useState('0x00FD...FAB6');
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-app)', padding: 'var(--sp-12)' }}>
      <div style={{ width: 380, display: 'flex', flexDirection: 'column', gap: 'var(--sp-9)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          <span style={{ font: 'var(--type-h2)', letterSpacing: 'var(--ls-display)' }}>Terminalfor</span>
          <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>AI-POWERED TRADING</span>
        </div>
        <Card variant="panel" padding="var(--pad-panel)" glow="accent" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
          <div>
            <div style={{ font: 'var(--type-h3)' }}>Connect a wallet</div>
            <div style={{ font: 'var(--type-body-sm)', color: 'var(--text-faint)' }}>Read-only session. Nothing is signed until you trade.</div>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>WALLET ADDRESS</span>
            <input value={addr} onChange={e => setAddr(e.target.value)}
              style={{ height: 'var(--control-h-lg)', padding: '0 var(--sp-6)', background: 'var(--surface-inset)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-control)', color: 'var(--text-primary)', font: 'var(--type-numeric-strong)', outline: 'none' }} />
          </label>
          <div style={{ display: 'flex', gap: 'var(--sp-4)' }}>
            {['btc', 'eth', 'usdt', 'sol'].map(s => <CoinMark key={s} symbol={s} size={22} />)}
            <span style={{ font: 'var(--type-label)', color: 'var(--text-faint)', alignSelf: 'center' }}>+ 128 assets</span>
          </div>
          <Button variant="primary" size="lg" fullWidth trailingIcon="chevron-right" onClick={onSignIn}>Enter terminal</Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
            <Icon name="shield-check" size={13} />Session expires after 30 minutes idle<Badge tone="accent" style={{ marginLeft: 'auto' }}>Beta</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
Object.assign(window, { SignIn });
