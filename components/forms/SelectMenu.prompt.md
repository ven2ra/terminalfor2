Compact dropdown for view filters and currency pickers. 34px tall, chevron always visible, popover has a stronger hairline than the trigger.

```jsx
<SelectMenu options={['USDT','USDC','ETH']} value={cur} onChange={setCur} leading={<CoinMark symbol="usdt" size={16} />} />
```
