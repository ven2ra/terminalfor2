Monochrome line glyph for every UI affordance — the whole product uses Lucide at 1.5–2px optical stroke, never filled icons.

```jsx
<Icon name="wallet" size={16} />
<Icon name="trending-up" size={14} color="var(--positive)" />
```

Icons inherit `currentColor`, so color them by setting `color` on the parent. Coin/token marks are NOT this component — use `CoinMark` (data group), which renders real asset brand marks.
