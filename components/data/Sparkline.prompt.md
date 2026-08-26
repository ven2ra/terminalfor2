Trend micro-chart: 1.5px stroke + a vertical fade under it, no axes, no grid, no labels.

```jsx
<Sparkline points={series} tone="up" height={64} markers={[18]} />
```

Tone must agree with the accompanying DeltaChip sign; violet is for neutral/aggregate series.
