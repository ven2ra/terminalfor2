const { Card, Button, IconButton, SegmentedControl, SelectMenu, AmountField, RangeSlider, PromoBanner, CoinMark, PriceValue, CandleChart, Icon } = window.TerminalforDesignSystem_c51d59;

function ExchangePanel({ candles }) {
  const [mode, setMode] = React.useState('Buy');
  const [pct, setPct] = React.useState(62);
  const [spend, setSpend] = React.useState('90,020.9');
  const [quote, setQuote] = React.useState('USDT');
  const [target, setTarget] = React.useState('ETH');
  const receive = (Number(String(spend).replace(/,/g, '')) * 0.00042 || 0).toFixed(4);
  return (
    <aside style={{ width: 'var(--exchange-w)', flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--gap-card)', padding: 'var(--sp-9) var(--sp-9) var(--sp-9) 0' }}>
      <Card variant="panel" padding={0}>
        <PromoBanner countdown="16:09:46">Get 2.5% off fees for next</PromoBanner>
        <div style={{ padding: 'var(--pad-panel)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ font: 'var(--type-h2)', letterSpacing: 'var(--ls-display)' }}>Exchange</div>
              <div style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>Advanced trading tool</div>
            </div>
            <IconButton icon="maximize-2" size={30} label="Expand exchange" />
          </div>
          <SegmentedControl options={['Buy', 'Sell', 'Swap']} value={mode} onChange={setMode} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--sp-6)', padding: '10px var(--sp-6)', background: 'var(--surface-inset)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--r-lg)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
              <Icon name="wallet" size={16} style={{ background: 'var(--text-muted)' }} />
              <span style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>Wallet balance</span>
                <span style={{ font: 'var(--type-h3)', fontVariantNumeric: 'tabular-nums' }}>145,195 USDT</span>
              </span>
            </span>
            <IconButton icon="scan-line" size={30} label="Scan wallet" />
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            <AmountField label="Spend" value={spend} onChange={e => setSpend(e.target.value)}
              currency={<SelectMenu options={['USDT', 'USDC', 'DAI']} value={quote} onChange={setQuote} leading={<CoinMark symbol="usdt" size={16} />} />} />
            <AmountField label="Receive" value={receive} readOnly
              currency={<SelectMenu options={['ETH', 'BTC', 'SOL']} value={target} onChange={setTarget} leading={<CoinMark symbol={target.toLowerCase()} size={16} />} />} />
            <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: 'var(--r-circle)', background: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
              <Icon name="arrow-up-down" size={13} />
            </span>
          </div>
          <div style={{ font: 'var(--type-numeric)', color: 'var(--text-faint)', letterSpacing: 'var(--ls-ticker)' }}>1 {quote} = 0.00042 {target}</div>
          <RangeSlider value={pct} onChange={setPct} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--type-body-sm)', color: 'var(--text-muted)' }}>
              <span style={{ width: 6, height: 6, borderRadius: 'var(--r-circle)', background: 'var(--warn-500)', boxShadow: '0 0 8px rgba(245,182,56,.6)' }} />Gas fee
            </span>
            <span style={{ font: 'var(--type-numeric-strong)', color: 'var(--text-body)' }}>$2.50 USD</span>
          </div>
          <Button variant="primary" size="lg" fullWidth trailingIcon="chevron-right">{mode} {target}</Button>
        </div>
      </Card>
      <Card variant="panel" padding="var(--pad-panel)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <span style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--ls-label)', color: 'var(--text-faint)' }}>Total Transaction</span>
            <PriceValue value="4,837.00" suffix="USD" size="md" />
            <span style={{ font: 'var(--type-label)', fontSize: 'var(--fs-tiny)', color: 'var(--text-faint)' }}>
              <span style={{ color: 'var(--negative)' }}>-12% </span>From Previous Month
            </span>
          </div>
          <IconButton icon="ellipsis-vertical" size={28} label="Transaction actions" />
        </div>
        <CandleChart candles={candles} height={132} />
      </Card>
    </aside>
  );
}
Object.assign(window, { ExchangePanel });
