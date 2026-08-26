Real token logos (cryptocurrency-icons CDN) — never substitute a Lucide glyph or an emoji for an asset.

```jsx
<CoinMark symbol="btc" size={30} ring />
```

`COIN_COLOR[symbol]` gives that asset's brand color for accent ticks and chart strokes.

`CoinMark` handles tokens the CDN set doesn't ship (e.g. SUI) by rendering a monogram on the token's brand color — add such symbols to `NO_ART` so no failed request is made.
