/* @ds-bundle: {"format":4,"namespace":"TerminalforDesignSystem_c51d59","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"DeltaChip","sourcePath":"components/core/DeltaChip.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SectionHeader","sourcePath":"components/core/SectionHeader.jsx"},{"name":"AssetCard","sourcePath":"components/data/AssetCard.jsx"},{"name":"CandleChart","sourcePath":"components/data/CandleChart.jsx"},{"name":"COIN_COLOR","sourcePath":"components/data/CoinMark.jsx"},{"name":"CoinMark","sourcePath":"components/data/CoinMark.jsx"},{"name":"MarketTable","sourcePath":"components/data/MarketTable.jsx"},{"name":"PriceValue","sourcePath":"components/data/PriceValue.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"TickerStrip","sourcePath":"components/data/TickerStrip.jsx"},{"name":"AmountField","sourcePath":"components/forms/AmountField.jsx"},{"name":"FilterTabs","sourcePath":"components/forms/FilterTabs.jsx"},{"name":"RangeSlider","sourcePath":"components/forms/RangeSlider.jsx"},{"name":"SearchInput","sourcePath":"components/forms/SearchInput.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"SelectMenu","sourcePath":"components/forms/SelectMenu.jsx"},{"name":"PromoBanner","sourcePath":"components/navigation/PromoBanner.jsx"},{"name":"SidebarNav","sourcePath":"components/navigation/SidebarNav.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"06c2bac39477","components/core/Button.jsx":"584723560d77","components/core/Card.jsx":"81ec0a789c2a","components/core/DeltaChip.jsx":"2aeb236bc1f8","components/core/Icon.jsx":"175e4f3d3df1","components/core/IconButton.jsx":"14f0b730a918","components/core/SectionHeader.jsx":"ef0fbc9feaf3","components/data/AssetCard.jsx":"76c71e8e30ed","components/data/CandleChart.jsx":"e92fb625bd4b","components/data/CoinMark.jsx":"c94ac2393a7e","components/data/MarketTable.jsx":"52d936be3869","components/data/PriceValue.jsx":"49266e84d30b","components/data/Sparkline.jsx":"da38574269ee","components/data/TickerStrip.jsx":"548696e10eab","components/forms/AmountField.jsx":"65d63a4c491f","components/forms/FilterTabs.jsx":"5eca10f5441a","components/forms/RangeSlider.jsx":"e27ed2fe8d63","components/forms/SearchInput.jsx":"a12d5fc0c8cd","components/forms/SegmentedControl.jsx":"e5b01987e7fe","components/forms/SelectMenu.jsx":"39a6db85ed6f","components/navigation/PromoBanner.jsx":"b2e934358b84","components/navigation/SidebarNav.jsx":"e8be10d37284","components/navigation/TopBar.jsx":"d96434b5d47b","ui_kits/terminal/App.jsx":"a3a45c2499ab","ui_kits/terminal/Dashboard.jsx":"0ae6f0248cff","ui_kits/terminal/ExchangePanel.jsx":"26ffb1849390","ui_kits/terminal/Portfolio.jsx":"80d00c458eb4","ui_kits/terminal/SignIn.jsx":"67d75d29cb61","ui_kits/terminal/Transactions.jsx":"428f30bbd35b","ui_kits/terminal/data.js":"c6c579819541"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TerminalforDesignSystem_c51d59 = window.TerminalforDesignSystem_c51d59 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Tiny status label: "Beta" next to a nav item, a count on Support, "Live" on a panel. */
function Badge({
  tone = 'accent',
  children,
  style,
  ...rest
}) {
  const skin = {
    accent: {
      background: 'rgba(107,92,255,.9)',
      color: '#fff',
      border: '1px solid transparent'
    },
    neutral: {
      background: 'var(--surface-raised)',
      color: 'var(--text-body)',
      border: '1px solid var(--border-hairline)'
    },
    positive: {
      background: 'var(--positive-soft)',
      color: 'var(--positive)',
      border: '1px solid rgba(34,197,94,.25)'
    },
    negative: {
      background: 'var(--negative-soft)',
      color: 'var(--negative)',
      border: '1px solid rgba(239,68,68,.25)'
    },
    warn: {
      background: 'rgba(245,182,56,.14)',
      color: 'var(--warn-500)',
      border: '1px solid rgba(245,182,56,.25)'
    }
  }[tone];
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 16,
      padding: '0 6px',
      borderRadius: 'var(--r-xs)',
      font: 'var(--type-eyebrow)',
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-label)',
      ...skin,
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Matte surface container. Elevation reads through surface value + hairline, not drop shadow. */
function Card({
  variant = 'card',
  padding,
  interactive,
  glow,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const surf = {
    card: 'var(--surface-card)',
    panel: 'var(--surface-panel)',
    inset: 'var(--surface-inset)'
  }[variant];
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest, {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: surf,
      border: `1px solid ${interactive && hover ? 'var(--border-subtle)' : 'var(--border-hairline)'}`,
      borderRadius: variant === 'panel' ? 'var(--r-panel)' : 'var(--r-card)',
      padding: padding ?? 'var(--pad-card)',
      transition: 'var(--t-hover)',
      cursor: interactive ? 'pointer' : undefined,
      ...style
    }
  }), glow && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `var(--glow-${glow})`,
      opacity: .5,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@0.451.0/icons/';
/** Monochrome line glyph. Renders a Lucide SVG as a currentColor mask so it inherits text color. */
function Icon({
  name,
  size = 16,
  strokeWidth,
  color = 'currentColor',
  style,
  ...rest
}) {
  const url = `url("${BASE}${name}.svg")`;
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true"
  }, rest, {
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flex: '0 0 auto',
      background: color,
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SZ = {
  sm: {
    h: 30,
    px: 12,
    fs: 'var(--fs-xs)'
  },
  md: {
    h: 38,
    px: 16,
    fs: 'var(--fs-sm)'
  },
  lg: {
    h: 44,
    px: 20,
    fs: 'var(--fs-base)'
  }
};
/** Primary action. The hero variant is the violet gradient CTA ("Buy ETH") — one per view. */
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  fullWidth,
  disabled,
  children,
  style,
  ...rest
}) {
  const s = SZ[size] || SZ.md;
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const skin = {
    primary: {
      background: 'var(--gradient-cta)',
      color: 'var(--text-primary)',
      border: '1px solid rgba(107,92,255,.45)',
      boxShadow: hover ? 'var(--shadow-cta-glow)' : 'none'
    },
    secondary: {
      background: 'var(--surface-inset)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'none'
    },
    ghost: {
      background: hover ? 'var(--surface-hover)' : 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid transparent',
      boxShadow: 'none'
    },
    danger: {
      background: 'var(--negative-soft)',
      color: 'var(--negative)',
      border: '1px solid rgba(239,68,68,.3)',
      boxShadow: 'none'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false)
  }, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--sp-4)',
      height: s.h,
      padding: `0 ${s.px}px`,
      width: fullWidth ? '100%' : undefined,
      font: 'var(--type-body-sm)',
      fontSize: s.fs,
      fontWeight: 'var(--fw-semibold)',
      letterSpacing: 'var(--ls-body)',
      borderRadius: 'var(--r-control)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .38 : 1,
      transition: 'var(--t-hover),var(--t-press),box-shadow var(--dur-base) var(--ease-standard)',
      transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
      filter: variant === 'secondary' && hover ? 'brightness(1.35)' : 'none',
      ...skin,
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'sm' ? 13 : 15
  }), children, trailingIcon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: trailingIcon,
    size: size === 'sm' ? 13 : 15
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/DeltaChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Signed percentage pill. Green tint up, red tint down — the most repeated element in the product. */
function DeltaChip({
  value,
  showIcon = false,
  size = 'md',
  style,
  ...rest
}) {
  const up = value >= 0;
  const fmt = `${up ? '+' : '-'}${Math.abs(value).toFixed(2)}%`;
  const dense = size === 'sm';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      height: dense ? 18 : 22,
      padding: dense ? '0 7px' : '0 9px',
      borderRadius: 'var(--r-chip)',
      background: up ? 'var(--positive-soft)' : 'var(--negative-soft)',
      color: up ? 'var(--positive)' : 'var(--negative)',
      font: 'var(--type-label)',
      fontSize: dense ? 'var(--fs-micro)' : 'var(--fs-tiny)',
      fontWeight: 'var(--fw-semibold)',
      fontVariantNumeric: 'tabular-nums',
      ...style
    }
  }), showIcon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: up ? 'trending-up' : 'trending-down',
    size: dense ? 10 : 12
  }), fmt);
}
Object.assign(__ds_scope, { DeltaChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/DeltaChip.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square glyph-only control: card overflow menus, notifications, expand, collapse rail. */
function IconButton({
  icon,
  size = 32,
  variant = 'inset',
  label,
  dot,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const bg = variant === 'bare' ? hover ? 'var(--surface-hover)' : 'transparent' : hover ? 'var(--surface-raised)' : 'var(--surface-inset)';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest, {
    style: {
      position: 'relative',
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: bg,
      border: variant === 'bare' ? '1px solid transparent' : '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-icon-btn)',
      color: hover ? 'var(--text-primary)' : 'var(--text-muted)',
      cursor: 'pointer',
      transition: 'var(--t-hover)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * .48)
  }), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 5,
      height: 5,
      borderRadius: 'var(--r-circle)',
      background: 'var(--accent)'
    }
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Section title with a live-status eyebrow and a right-aligned actions slot. */
function SectionHeader({
  eyebrow,
  eyebrowIcon,
  title,
  live,
  actions,
  size = 'md',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--sp-8)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-label)',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-faint)'
    }
  }, live && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 'var(--r-circle)',
      background: 'var(--text-body)',
      boxShadow: '0 0 0 3px rgba(255,255,255,.07)'
    }
  }), eyebrowIcon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: eyebrowIcon,
    size: 12
  }), eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: size === 'lg' ? 'var(--type-display)' : 'var(--type-h2)',
      letterSpacing: 'var(--ls-display)',
      color: 'var(--text-primary)'
    }
  }, title)), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-4)'
    }
  }, actions));
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/data/CandleChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Green/red OHLC candles — used for transaction volume and pair history. */
function CandleChart({
  candles = [],
  height = 150,
  gap = 2,
  style,
  ...rest
}) {
  const lows = candles.map(c => c.l),
    highs = candles.map(c => c.h);
  const min = Math.min(...lows),
    max = Math.max(...highs),
    span = max - min || 1;
  const y = v => (1 - (v - min) / span) * height;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap,
      height,
      ...style
    }
  }), candles.map((c, i) => {
    const up = c.c >= c.o;
    const color = up ? 'var(--chart-up)' : 'var(--chart-down)';
    const top = y(Math.max(c.o, c.c)),
      bot = y(Math.min(c.o, c.c));
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        flex: 1,
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 1,
        top: y(c.h),
        height: Math.max(1, y(c.l) - y(c.h)),
        background: color,
        opacity: .55
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        height: Math.max(2, bot - top),
        background: color,
        borderRadius: 1
      }
    }));
  }));
}
Object.assign(__ds_scope, { CandleChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/CandleChart.jsx", error: String((e && e.message) || e) }); }

// components/data/CoinMark.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CDN = 'https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/';
const COIN_COLOR = {
  btc: 'var(--coin-btc)',
  eth: 'var(--coin-eth)',
  usdt: 'var(--coin-usdt)',
  sol: 'var(--coin-sol)',
  doge: 'var(--coin-doge)',
  ltc: 'var(--coin-ltc)',
  matic: 'var(--coin-matic)',
  uni: 'var(--coin-uni)',
  sui: 'var(--coin-sui)'
};
// Tokens the CDN set does not ship — render the monogram directly, no failed request.
const NO_ART = new Set(['sui']);
/** Circular asset mark. Uses the real token logo from the cryptocurrency-icons set. */
function CoinMark({
  symbol,
  size = 22,
  ring,
  style,
  ...rest
}) {
  const s = String(symbol || '').toLowerCase();
  const [failed, setFailed] = React.useState(false);
  const missing = failed || NO_ART.has(s);
  const brand = COIN_COLOR[s] || 'var(--accent)';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flex: '0 0 auto',
      borderRadius: 'var(--r-circle)',
      background: missing ? brand : 'var(--surface-raised)',
      overflow: 'hidden',
      boxShadow: ring ? `0 0 0 3px color-mix(in srgb, ${brand} 22%, transparent)` : 'none',
      ...style
    }
  }), missing ? /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontSize: Math.max(8, Math.round(size * .42)),
      fontWeight: 'var(--fw-bold)',
      color: '#0b0d10',
      letterSpacing: 0
    }
  }, s.slice(0, 1).toUpperCase()) : /*#__PURE__*/React.createElement("img", {
    src: `${CDN}${s}.svg`,
    alt: s.toUpperCase(),
    width: size,
    height: size,
    onError: () => setFailed(true),
    style: {
      display: 'block'
    }
  }));
}
Object.assign(__ds_scope, { COIN_COLOR, CoinMark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/CoinMark.jsx", error: String((e && e.message) || e) }); }

// components/data/PriceValue.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Big price with de-emphasised trailing digits — integer white, decimals muted. */
function PriceValue({
  value,
  currency = '$',
  suffix,
  size = 'lg',
  style,
  ...rest
}) {
  const str = typeof value === 'number' ? value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) : String(value);
  const cut = Math.max(0, str.length - 3);
  const head = str.slice(0, cut),
    tail = str.slice(cut);
  const fonts = {
    sm: 'var(--type-h3)',
    md: 'var(--type-h2)',
    lg: 'var(--type-price)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      font: fonts[size],
      letterSpacing: 'var(--ls-display)',
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums',
      ...style
    }
  }), currency, head, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--n-400)'
    }
  }, tail), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      marginLeft: 6
    }
  }, suffix));
}
Object.assign(__ds_scope, { PriceValue });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PriceValue.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function path(points, w, h) {
  const min = Math.min(...points),
    max = Math.max(...points),
    span = max - min || 1;
  return points.map((p, i) => `${i ? 'L' : 'M'}${(i / (points.length - 1) * w).toFixed(1)},${(h - (p - min) / span * h).toFixed(1)}`).join(' ');
}
/** Area sparkline with a soft under-glow — the chart language of every card and row. */
function Sparkline({
  points = [],
  width = 220,
  height = 64,
  tone = 'accent',
  markers = [],
  style,
  ...rest
}) {
  const stroke = {
    accent: 'var(--chart-line)',
    up: 'var(--chart-up)',
    down: 'var(--chart-down)'
  }[tone];
  const id = React.useMemo(() => 'sg' + Math.random().toString(36).slice(2, 8), []);
  const d = path(points, width, height);
  const min = Math.min(...points),
    max = Math.max(...points),
    span = max - min || 1;
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: `0 0 ${width} ${height}`,
    width: "100%",
    height: height,
    preserveAspectRatio: "none"
  }, rest, {
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: stroke,
    stopOpacity: ".35"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: stroke,
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: `${d} L${width},${height} L0,${height} Z`,
    fill: `url(#${id})`
  }), /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: stroke,
    strokeWidth: "1.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }), markers.map(i => {
    const x = i / (points.length - 1) * width,
      y = height - (points[i] - min) / span * height;
    return /*#__PURE__*/React.createElement("circle", {
      key: i,
      cx: x,
      cy: y,
      r: "2.5",
      fill: "#fff"
    });
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data/AssetCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Watch-tile for one trading pair: identity, price, delta and a glowing sparkline. */
function AssetCard({
  symbol,
  name,
  pair,
  price,
  delta,
  series = [],
  onMenu,
  style,
  ...rest
}) {
  const tone = delta >= 0 ? 'up' : 'down';
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    interactive: true,
    glow: tone,
    padding: "var(--pad-card)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-6)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.CoinMark, {
    symbol: symbol,
    size: 30,
    ring: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, pair), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-h3)',
      color: 'var(--text-primary)'
    }
  }, name)), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "ellipsis-vertical",
    size: 26,
    label: `${name} actions`,
    onClick: onMenu
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 'var(--bw-accent-tick)',
      borderRadius: 'var(--r-pill)',
      background: __ds_scope.COIN_COLOR[String(symbol).toLowerCase()] || 'var(--accent)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, "Price"), /*#__PURE__*/React.createElement(__ds_scope.PriceValue, {
    value: price
  }), /*#__PURE__*/React.createElement(__ds_scope.DeltaChip, {
    value: delta,
    showIcon: true,
    style: {
      alignSelf: 'flex-start',
      marginTop: 2
    }
  }))), /*#__PURE__*/React.createElement(__ds_scope.Sparkline, {
    points: series,
    tone: tone,
    height: 58,
    markers: series.length ? [Math.floor(series.length * .72)] : [],
    style: {
      marginBottom: -16,
      marginInline: -16
    }
  }));
}
Object.assign(__ds_scope, { AssetCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/AssetCard.jsx", error: String((e && e.message) || e) }); }

// components/data/MarketTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Dense market ledger. Columns: rank, coin, price, three deltas, market cap, volume, chart. */
function MarketTable({
  rows = [],
  deltaLabels = ['1H %', '24H %', '7D %'],
  style,
  ...rest
}) {
  const th = {
    font: 'var(--type-label)',
    fontSize: 'var(--fs-tiny)',
    color: 'var(--text-faint)',
    fontWeight: 'var(--fw-medium)',
    textAlign: 'left',
    padding: '0 var(--sp-6) var(--sp-6)',
    whiteSpace: 'nowrap'
  };
  const td = {
    padding: 'var(--sp-5) var(--sp-6)',
    borderTop: '1px solid var(--border-hairline)',
    whiteSpace: 'nowrap'
  };
  const sortable = label => /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, label, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevrons-up-down",
    size: 11,
    style: {
      background: 'var(--n-500)'
    }
  }));
  return /*#__PURE__*/React.createElement("table", _extends({}, rest, {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      ...style
    }
  }), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "No"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, sortable('Coin name')), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, sortable('Price')), deltaLabels.map(l => /*#__PURE__*/React.createElement("th", {
    key: l,
    style: {
      ...th,
      textAlign: 'center'
    }
  }, l)), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, sortable('Market Cap')), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, sortable('Volume (7D)')), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Chart"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.symbol + i,
    style: {
      transition: 'var(--t-hover)'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--surface-hover)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      font: 'var(--type-numeric)',
      color: 'var(--text-faint)'
    }
  }, "#", i + 1), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.CoinMark, {
    symbol: r.symbol,
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-primary)'
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, r.symbol.toUpperCase()))), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      font: 'var(--type-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, r.price), (r.deltas || []).map((d, j) => /*#__PURE__*/React.createElement("td", {
    key: j,
    style: {
      ...td,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.DeltaChip, {
    value: d,
    size: "sm"
  }))), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      font: 'var(--type-numeric)',
      color: 'var(--text-faint)',
      letterSpacing: 'var(--ls-ticker)'
    }
  }, r.marketCap), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      font: 'var(--type-numeric-strong)',
      color: 'var(--text-primary)'
    }
  }, r.volume), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      width: 110
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Sparkline, {
    points: r.series || [],
    tone: r.deltas && r.deltas[1] >= 0 ? 'up' : 'down',
    height: 30,
    width: 100
  }))))));
}
Object.assign(__ds_scope, { MarketTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MarketTable.jsx", error: String((e && e.message) || e) }); }

// components/data/TickerStrip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Full-bleed price ribbon under the topbar. */
function TickerStrip({
  items = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-14)',
      height: 'var(--ticker-h)',
      padding: '0 var(--sp-9)',
      overflow: 'hidden',
      background: 'var(--bg-app)',
      borderBlock: '1px solid var(--border-hairline)',
      ...style
    }
  }), items.map((it, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-4)',
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-numeric-strong)',
      color: 'var(--text-body)'
    }
  }, it.price), /*#__PURE__*/React.createElement(__ds_scope.CoinMark, {
    symbol: it.symbol,
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-primary)'
    }
  }, it.symbol.toUpperCase()), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-faint)'
    }
  }, "/", it.quote || 'USDT'))));
}
Object.assign(__ds_scope, { TickerStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TickerStrip.jsx", error: String((e && e.message) || e) }); }

// components/forms/AmountField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Spend/Receive row: label, big editable amount, currency picker on the right. */
function AmountField({
  label,
  value,
  onChange,
  currency,
  readOnly,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--sp-6)',
      padding: '10px var(--sp-6)',
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-lg)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, label), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: onChange,
    readOnly: readOnly,
    inputMode: "decimal",
    style: {
      width: '100%',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: 0,
      color: 'var(--text-primary)',
      font: 'var(--type-h3)',
      fontVariantNumeric: 'tabular-nums'
    }
  })), currency);
}
Object.assign(__ds_scope, { AmountField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/AmountField.jsx", error: String((e && e.message) || e) }); }

// components/forms/FilterTabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Pill filter row over a table: All / Trends / Favorites / Top Gainers / Top Losers. */
function FilterTabs({
  options = [],
  value,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-3)',
      flexWrap: 'wrap',
      ...style
    }
  }), options.map(o => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      type: "button",
      onClick: () => onChange && onChange(o),
      style: {
        height: 30,
        padding: '0 var(--sp-6)',
        cursor: 'pointer',
        borderRadius: 'var(--r-sm)',
        background: on ? 'var(--accent-soft)' : 'var(--surface-inset)',
        border: `1px solid ${on ? 'var(--border-accent)' : 'var(--border-hairline)'}`,
        color: on ? '#cfc7ff' : 'var(--text-muted)',
        font: 'var(--type-body-sm)',
        fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        transition: 'var(--t-hover)'
      }
    }, o);
  }));
}
Object.assign(__ds_scope, { FilterTabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FilterTabs.jsx", error: String((e && e.message) || e) }); }

// components/forms/RangeSlider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Percentage-of-balance slider with a violet glow track. */
function RangeSlider({
  value = 0,
  onChange,
  showValue = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-6)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      height: 16,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: '6px 0',
      borderRadius: 'var(--r-pill)',
      background: 'var(--surface-raised)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 6,
      bottom: 6,
      width: `${value}%`,
      borderRadius: 'var(--r-pill)',
      background: 'linear-gradient(90deg,#2a2472,#8b7bff)',
      boxShadow: '0 0 12px rgba(139,123,255,.5)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: `calc(${value}% - 6px)`,
      width: 12,
      height: 12,
      borderRadius: 'var(--r-circle)',
      background: '#fff',
      boxShadow: '0 0 0 3px rgba(139,123,255,.35)'
    }
  }), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 0,
    max: 100,
    value: value,
    onChange: e => onChange && onChange(Number(e.target.value)),
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      opacity: 0,
      cursor: 'pointer',
      margin: 0
    }
  })), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums',
      minWidth: 34,
      textAlign: 'right'
    }
  }, value, "%"));
}
Object.assign(__ds_scope, { RangeSlider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RangeSlider.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Topbar search field with a keyboard-shortcut affordance. */
function SearchInput({
  placeholder = 'Search...',
  shortcut = '/',
  value,
  onChange,
  width = 360,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-4)',
      width,
      height: 'var(--control-h)',
      padding: '0 var(--sp-5)',
      background: 'var(--surface-inset)',
      borderRadius: 'var(--r-control)',
      border: `1px solid ${focus ? 'var(--border-accent)' : 'var(--border-hairline)'}`,
      boxShadow: focus ? 'var(--shadow-focus)' : 'none',
      transition: 'var(--t-hover),box-shadow var(--dur-fast) var(--ease-standard)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 14,
    style: {
      background: 'var(--text-faint)'
    }
  }), /*#__PURE__*/React.createElement("input", _extends({
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest, {
    style: {
      flex: 1,
      minWidth: 0,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'var(--text-primary)',
      font: 'var(--type-body-sm)',
      letterSpacing: 'var(--ls-body)'
    }
  })), shortcut && /*#__PURE__*/React.createElement("kbd", {
    style: {
      font: 'var(--type-numeric)',
      color: 'var(--text-faint)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-xs)',
      padding: '1px 5px'
    }
  }, shortcut));
}
Object.assign(__ds_scope, { SearchInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Buy / Sell / Swap style switch inside an inset track. */
function SegmentedControl({
  options = [],
  value,
  onChange,
  fullWidth = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      gap: 2,
      padding: 3,
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-control)',
      width: fullWidth ? '100%' : undefined,
      ...style
    }
  }), options.map(o => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      type: "button",
      onClick: () => onChange && onChange(o),
      style: {
        flex: 1,
        height: 30,
        border: 'none',
        cursor: 'pointer',
        borderRadius: 'var(--r-sm)',
        background: on ? 'var(--surface-raised)' : 'transparent',
        color: on ? 'var(--text-primary)' : 'var(--text-faint)',
        font: 'var(--type-body-sm)',
        fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        boxShadow: on ? 'var(--shadow-inset-hairline)' : 'none',
        transition: 'var(--t-hover)'
      }
    }, o);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/SelectMenu.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Compact filter dropdown ("USDT", "Top Gainers", "7D"). Opens a hairline popover. */
function SelectMenu({
  options = [],
  value,
  onChange,
  leading,
  width,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      position: 'relative',
      ...style
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOpen(o => !o),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-4)',
      height: 'var(--control-h)',
      width,
      padding: '0 var(--sp-5)',
      background: hover || open ? 'var(--surface-raised)' : 'var(--surface-inset)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-control)',
      cursor: 'pointer',
      color: 'var(--text-body)',
      font: 'var(--type-body-sm)',
      fontWeight: 'var(--fw-medium)',
      transition: 'var(--t-hover)'
    }
  }, leading, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'left'
    }
  }, value), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 13,
    style: {
      background: 'var(--text-faint)',
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform var(--dur-fast) var(--ease-standard)'
    }
  })), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 'calc(100% + 6px)',
      left: 0,
      minWidth: '100%',
      zIndex: 40,
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-popover)',
      padding: 'var(--sp-3)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o,
    type: "button",
    onClick: () => {
      onChange && onChange(o);
      setOpen(false);
    },
    style: {
      textAlign: 'left',
      padding: '7px 10px',
      borderRadius: 'var(--r-sm)',
      border: 'none',
      cursor: 'pointer',
      background: o === value ? 'var(--surface-active)' : 'transparent',
      color: o === value ? 'var(--text-primary)' : 'var(--text-muted)',
      font: 'var(--type-body-sm)',
      whiteSpace: 'nowrap'
    }
  }, o))));
}
Object.assign(__ds_scope, { SelectMenu });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SelectMenu.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PromoBanner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Thin promo strip with a countdown, sitting on a magenta-to-transparent wash. */
function PromoBanner({
  children,
  countdown,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--sp-6)',
      padding: '9px var(--sp-7)',
      background: 'var(--gradient-promo)',
      borderBottom: '1px solid var(--border-hairline)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-5)',
      font: 'var(--type-label)',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 'var(--r-circle)',
      background: '#ff2d6f',
      boxShadow: '0 0 8px #ff2d6f'
    }
  }), children), countdown && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-numeric-strong)',
      color: 'var(--text-primary)'
    }
  }, countdown));
}
Object.assign(__ds_scope, { PromoBanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PromoBanner.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The left rail: brand lockup, greeting, grouped nav sections, log out. */
function SidebarNav({
  brand = 'Terminalfor',
  tagline = 'AI-Powered Trading',
  greeting,
  meta,
  groups = [],
  active,
  onSelect,
  onCollapse,
  footer,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    style: {
      width: 'var(--rail-w)',
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-rail)',
      borderRight: '1px solid var(--border-hairline)',
      padding: 'var(--sp-7) var(--sp-6)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-5)',
      paddingBottom: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-h3)',
      fontSize: 'var(--fs-base)',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-primary)'
    }
  }, brand), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, tagline)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onCollapse,
    "aria-label": "Collapse sidebar",
    style: {
      width: 24,
      height: 24,
      display: 'grid',
      placeItems: 'center',
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-sm)',
      color: 'var(--text-muted)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-left",
    size: 12
  }))), greeting && /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 'var(--sp-9)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--type-h2)',
      letterSpacing: 'var(--ls-display)',
      color: 'var(--text-primary)'
    }
  }, greeting), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-faint)'
    }
  }, meta)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)',
      overflow: 'hidden auto',
      scrollbarWidth: 'none'
    }
  }, groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--n-500)',
      padding: '0 var(--sp-5) var(--sp-3)'
    }
  }, g.label), g.items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onSelect && onSelect(it.id),
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = 'var(--surface-hover)';
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = 'transparent';
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-6)',
        height: 33,
        flex: '0 0 auto',
        padding: '0 var(--sp-5)',
        borderRadius: 'var(--r-nav-item)',
        cursor: 'pointer',
        textAlign: 'left',
        background: on ? 'var(--gradient-nav-active)' : 'transparent',
        border: `1px solid ${on ? 'var(--border-subtle)' : 'transparent'}`,
        color: on ? 'var(--text-primary)' : 'var(--text-muted)',
        font: 'var(--type-body-sm)',
        fontWeight: on ? 'var(--fw-semibold)' : 'var(--fw-medium)',
        transition: 'var(--t-hover)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, it.label), it.badge && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      tone: it.badge === 'Beta' ? 'accent' : 'neutral'
    }, it.badge), it.dot && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: 'var(--r-circle)',
        background: 'var(--text-faint)'
      }
    }));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 'var(--sp-8)'
    }
  }, footer || /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-6)',
      height: 36,
      width: '100%',
      padding: '0 var(--sp-5)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--text-muted)',
      font: 'var(--type-body-sm)',
      fontWeight: 'var(--fw-medium)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "log-out",
    size: 16
  }), "Log out")));
}
Object.assign(__ds_scope, { SidebarNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** App topbar: breadcrumb, centred search, utility icons, wallet chip. */
function TopBar({
  crumbs = [],
  wallet,
  address,
  onSearch,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({}, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-9)',
      height: 'var(--topbar-h)',
      padding: '0 var(--sp-9)',
      background: 'var(--bg-app)',
      borderBottom: '1px solid var(--border-hairline)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-4)',
      minWidth: 180
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "home",
    size: 15,
    style: {
      background: 'var(--text-muted)'
    }
  }), crumbs.map((c, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: c
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--n-500)',
      font: 'var(--type-body-sm)'
    }
  }, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      fontWeight: i === crumbs.length - 1 ? 'var(--fw-semibold)' : 'var(--fw-regular)',
      color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)'
    }
  }, c)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.SearchInput, {
    width: 420,
    onChange: onSearch
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "message-square",
    size: 34,
    label: "Messages"
  }), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "bell",
    size: 34,
    label: "Notifications",
    dot: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-4)',
      paddingLeft: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      color: 'var(--text-primary)'
    }
  }, wallet), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      font: 'var(--type-numeric)',
      color: 'var(--text-faint)'
    }
  }, address, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "copy",
    size: 11
  }))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 14,
    style: {
      background: 'var(--text-faint)'
    }
  }))));
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/terminal/App.jsx
try { (() => {
const {
  SidebarNav,
  TopBar,
  TickerStrip,
  Card,
  SectionHeader
} = window.TerminalforDesignSystem_c51d59;
function Placeholder({
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--sp-9)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "panel",
    padding: "var(--pad-panel)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: title,
    eyebrow: "Not present in the source material"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body-sm)',
      color: 'var(--text-faint)',
      maxWidth: 520
    }
  }, "The reference material only documents the Dashboard, the exchange panel and the market ledger. This view is intentionally left blank rather than invented \u2014 see readme.md.")));
}
function App() {
  const data = window.TF_DATA;
  const [signedIn, setSignedIn] = React.useState(true);
  const [view, setView] = React.useState('dashboard');
  if (!signedIn) return /*#__PURE__*/React.createElement(SignIn, {
    onSignIn: () => setSignedIn(true)
  });
  const crumbs = {
    dashboard: ['Overview', 'Dashboard'],
    portfolio: ['Account', 'Portfolio'],
    transactions: ['Activity', 'Transactions']
  }[view] || ['Overview', view.charAt(0).toUpperCase() + view.slice(1)];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg-app)'
    }
  }, /*#__PURE__*/React.createElement(SidebarNav, {
    greeting: /*#__PURE__*/React.createElement(React.Fragment, null, "Welcome", /*#__PURE__*/React.createElement("br", null), "Back, Jason"),
    meta: "Last login 15 Jun 2025",
    groups: data.navGroups,
    active: view,
    onSelect: setView,
    footer: /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => setSignedIn(false),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-6)',
        height: 36,
        width: '100%',
        padding: '0 var(--sp-5)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        font: 'var(--type-body-sm)',
        fontWeight: 'var(--fw-medium)'
      }
    }, "Log out"),
    style: {
      position: 'sticky',
      top: 0,
      height: '100vh'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    crumbs: crumbs,
    wallet: "Your Wallet",
    address: "0x00FD...FAB6"
  }), /*#__PURE__*/React.createElement(TickerStrip, {
    items: data.tickers
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, view === 'dashboard' && /*#__PURE__*/React.createElement(Dashboard, {
    data: data
  }), view === 'portfolio' && /*#__PURE__*/React.createElement(Portfolio, {
    data: data
  }), view === 'transactions' && /*#__PURE__*/React.createElement(Transactions, {
    data: data
  }), !['dashboard', 'portfolio', 'transactions'].includes(view) && /*#__PURE__*/React.createElement(Placeholder, {
    title: view.charAt(0).toUpperCase() + view.slice(1)
  })), view === 'dashboard' && /*#__PURE__*/React.createElement(ExchangePanel, {
    candles: data.candles
  }))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/terminal/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/terminal/Dashboard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  SectionHeader,
  Button,
  SelectMenu,
  FilterTabs,
  AssetCard,
  MarketTable,
  Card
} = window.TerminalforDesignSystem_c51d59;
function Dashboard({
  data
}) {
  const [tab, setTab] = React.useState('All');
  const [cur, setCur] = React.useState('USDT');
  const rows = tab === 'Top Gainers' ? data.rows.filter(r => r.deltas[1] >= 0) : tab === 'Top Losers' ? data.rows.filter(r => r.deltas[1] < 0) : data.rows;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-section)',
      padding: 'var(--sp-9)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    live: true,
    eyebrow: /*#__PURE__*/React.createElement(React.Fragment, null, "Last update ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--text-body)'
      }
    }, "2 min ago")),
    size: "lg",
    title: "Live Crypto Updates",
    actions: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 'var(--sp-5)'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      trailingIcon: "chevron-right"
    }, "See all"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--sp-4)'
      }
    }, /*#__PURE__*/React.createElement(SelectMenu, {
      options: ['USDT', 'USDC', 'ETH'],
      value: cur,
      onChange: setCur
    }), /*#__PURE__*/React.createElement(SelectMenu, {
      options: ['Top Gainers', 'Top Losers'],
      value: "Top Gainers"
    }), /*#__PURE__*/React.createElement(SelectMenu, {
      options: ['24H', '7D', '30D'],
      value: "7D"
    })))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 'var(--gap-card)'
    }
  }, data.cards.map(c => /*#__PURE__*/React.createElement(AssetCard, _extends({
    key: c.symbol
  }, c)))), /*#__PURE__*/React.createElement(Card, {
    variant: "panel",
    padding: "var(--pad-panel)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrowIcon: "clock",
    eyebrow: "Live Updates",
    title: "Market Overview",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FilterTabs, {
      options: ['All', 'Trends', 'Favorites', 'Top Gainers', 'Top Losers'],
      value: tab,
      onChange: setTab
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      trailingIcon: "chevron-right"
    }, "See all"))
  }), /*#__PURE__*/React.createElement(MarketTable, {
    rows: rows
  })));
}
Object.assign(window, {
  Dashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/terminal/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/terminal/ExchangePanel.jsx
try { (() => {
const {
  Card,
  Button,
  IconButton,
  SegmentedControl,
  SelectMenu,
  AmountField,
  RangeSlider,
  PromoBanner,
  CoinMark,
  PriceValue,
  CandleChart,
  Icon
} = window.TerminalforDesignSystem_c51d59;
function ExchangePanel({
  candles
}) {
  const [mode, setMode] = React.useState('Buy');
  const [pct, setPct] = React.useState(62);
  const [spend, setSpend] = React.useState('90,020.9');
  const [quote, setQuote] = React.useState('USDT');
  const [target, setTarget] = React.useState('ETH');
  const receive = (Number(String(spend).replace(/,/g, '')) * 0.00042 || 0).toFixed(4);
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 'var(--exchange-w)',
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-card)',
      padding: 'var(--sp-9) var(--sp-9) var(--sp-9) 0'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "panel",
    padding: 0
  }, /*#__PURE__*/React.createElement(PromoBanner, {
    countdown: "16:09:46"
  }, "Get 2.5% off fees for next"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--pad-panel)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--ls-display)'
    }
  }, "Exchange"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-faint)'
    }
  }, "Advanced trading tool")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "maximize-2",
    size: 30,
    label: "Expand exchange"
  })), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ['Buy', 'Sell', 'Swap'],
    value: mode,
    onChange: setMode
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--sp-6)',
      padding: '10px var(--sp-6)',
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-lg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "wallet",
    size: 16,
    style: {
      background: 'var(--text-muted)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, "Wallet balance"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-h3)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "145,195 USDT"))), /*#__PURE__*/React.createElement(IconButton, {
    icon: "scan-line",
    size: 30,
    label: "Scan wallet"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement(AmountField, {
    label: "Spend",
    value: spend,
    onChange: e => setSpend(e.target.value),
    currency: /*#__PURE__*/React.createElement(SelectMenu, {
      options: ['USDT', 'USDC', 'DAI'],
      value: quote,
      onChange: setQuote,
      leading: /*#__PURE__*/React.createElement(CoinMark, {
        symbol: "usdt",
        size: 16
      })
    })
  }), /*#__PURE__*/React.createElement(AmountField, {
    label: "Receive",
    value: receive,
    readOnly: true,
    currency: /*#__PURE__*/React.createElement(SelectMenu, {
      options: ['ETH', 'BTC', 'SOL'],
      value: target,
      onChange: setTarget,
      leading: /*#__PURE__*/React.createElement(CoinMark, {
        symbol: target.toLowerCase(),
        size: 16
      })
    })
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%,-50%)',
      width: 30,
      height: 30,
      borderRadius: 'var(--r-circle)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-subtle)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-down",
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-numeric)',
      color: 'var(--text-faint)',
      letterSpacing: 'var(--ls-ticker)'
    }
  }, "1 ", quote, " = 0.00042 ", target), /*#__PURE__*/React.createElement(RangeSlider, {
    value: pct,
    onChange: setPct
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-body-sm)',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 'var(--r-circle)',
      background: 'var(--warn-500)',
      boxShadow: '0 0 8px rgba(245,182,56,.6)'
    }
  }), "Gas fee"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-numeric-strong)',
      color: 'var(--text-body)'
    }
  }, "$2.50 USD")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    trailingIcon: "chevron-right"
  }, mode, " ", target))), /*#__PURE__*/React.createElement(Card, {
    variant: "panel",
    padding: "var(--pad-panel)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, "Total Transaction"), /*#__PURE__*/React.createElement(PriceValue, {
    value: "4,837.00",
    suffix: "USD",
    size: "md"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-faint)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--negative)'
    }
  }, "-12% "), "From Previous Month")), /*#__PURE__*/React.createElement(IconButton, {
    icon: "ellipsis-vertical",
    size: 28,
    label: "Transaction actions"
  })), /*#__PURE__*/React.createElement(CandleChart, {
    candles: candles,
    height: 132
  })));
}
Object.assign(window, {
  ExchangePanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/terminal/ExchangePanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/terminal/Portfolio.jsx
try { (() => {
const {
  SectionHeader,
  Card,
  PriceValue,
  DeltaChip,
  CoinMark,
  Sparkline,
  Button,
  SelectMenu,
  IconButton
} = window.TerminalforDesignSystem_c51d59;
function Portfolio({
  data
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-section)',
      padding: 'var(--sp-9)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    live: true,
    eyebrow: "Synced 40 seconds ago",
    size: "lg",
    title: "Portfolio",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SelectMenu, {
      options: ['All wallets', 'Cold storage'],
      value: "All wallets"
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "download"
    }, "Export"))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr',
      gap: 'var(--gap-card)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    glow: "accent",
    padding: "var(--pad-panel)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, "Total balance"), /*#__PURE__*/React.createElement(PriceValue, {
    value: "169,196.56"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(DeltaChip, {
    value: 3.42,
    showIcon: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-faint)'
    }
  }, "+$5,589.10 today")), /*#__PURE__*/React.createElement(Sparkline, {
    points: data.rows[2].series,
    tone: "accent",
    height: 54,
    style: {
      marginInline: -20,
      marginBottom: -20
    }
  })), [['Realised P&L', '12,480.22', 8.14], ['Unrealised P&L', '-3,102.68', -2.66]].map(([l, v, d]) => /*#__PURE__*/React.createElement(Card, {
    key: l,
    padding: "var(--pad-panel)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, l), /*#__PURE__*/React.createElement(PriceValue, {
    value: v,
    size: "md"
  }), /*#__PURE__*/React.createElement(DeltaChip, {
    value: d,
    showIcon: true,
    style: {
      alignSelf: 'flex-start'
    }
  })))), /*#__PURE__*/React.createElement(Card, {
    variant: "panel",
    padding: "var(--pad-panel)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Holdings",
    eyebrow: "4 assets",
    actions: /*#__PURE__*/React.createElement(IconButton, {
      icon: "ellipsis-vertical",
      size: 28,
      label: "Holdings actions"
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, data.holdings.map(h => /*#__PURE__*/React.createElement("div", {
    key: h.symbol,
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr 1fr 1.4fr 90px',
      alignItems: 'center',
      gap: 'var(--sp-8)',
      padding: 'var(--sp-6) 0',
      borderTop: '1px solid var(--border-hairline)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(CoinMark, {
    symbol: h.symbol,
    size: 26,
    ring: true
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, h.name), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-numeric)',
      color: 'var(--text-faint)'
    }
  }, h.amount))), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-body-sm)',
      fontWeight: 'var(--fw-semibold)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, h.value), /*#__PURE__*/React.createElement(DeltaChip, {
    value: h.delta,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 4,
      borderRadius: 'var(--r-pill)',
      background: 'var(--surface-raised)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      width: h.alloc + '%',
      height: '100%',
      background: 'linear-gradient(90deg,#2a2472,#8b7bff)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-numeric-strong)',
      color: 'var(--text-muted)'
    }
  }, h.alloc, "%")), /*#__PURE__*/React.createElement(Sparkline, {
    points: data.rows[0].series,
    tone: h.delta >= 0 ? 'up' : 'down',
    height: 28,
    width: 90
  }))))));
}
Object.assign(window, {
  Portfolio
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/terminal/Portfolio.jsx", error: String((e && e.message) || e) }); }

// ui_kits/terminal/SignIn.jsx
try { (() => {
const {
  Card,
  Button,
  Badge,
  Icon,
  CoinMark
} = window.TerminalforDesignSystem_c51d59;
function SignIn({
  onSignIn
}) {
  const [addr, setAddr] = React.useState('0x00FD...FAB6');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--bg-app)',
      padding: 'var(--sp-12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 380,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-9)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-h2)',
      letterSpacing: 'var(--ls-display)'
    }
  }, "Terminalfor"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, "AI-POWERED TRADING")), /*#__PURE__*/React.createElement(Card, {
    variant: "panel",
    padding: "var(--pad-panel)",
    glow: "accent",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-h3)'
    }
  }, "Connect a wallet"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-body-sm)',
      color: 'var(--text-faint)'
    }
  }, "Read-only session. Nothing is signed until you trade.")), /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-eyebrow)',
      letterSpacing: 'var(--ls-label)',
      color: 'var(--text-faint)'
    }
  }, "WALLET ADDRESS"), /*#__PURE__*/React.createElement("input", {
    value: addr,
    onChange: e => setAddr(e.target.value),
    style: {
      height: 'var(--control-h-lg)',
      padding: '0 var(--sp-6)',
      background: 'var(--surface-inset)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--r-control)',
      color: 'var(--text-primary)',
      font: 'var(--type-numeric-strong)',
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--sp-4)'
    }
  }, ['btc', 'eth', 'usdt', 'sol'].map(s => /*#__PURE__*/React.createElement(CoinMark, {
    key: s,
    symbol: s,
    size: 22
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      color: 'var(--text-faint)',
      alignSelf: 'center'
    }
  }, "+ 128 assets")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true,
    trailingIcon: "chevron-right",
    onClick: onSignIn
  }, "Enter terminal"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-label)',
      fontSize: 'var(--fs-tiny)',
      color: 'var(--text-faint)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "shield-check",
    size: 13
  }), "Session expires after 30 minutes idle", /*#__PURE__*/React.createElement(Badge, {
    tone: "accent",
    style: {
      marginLeft: 'auto'
    }
  }, "Beta")))));
}
Object.assign(window, {
  SignIn
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/terminal/SignIn.jsx", error: String((e && e.message) || e) }); }

// ui_kits/terminal/Transactions.jsx
try { (() => {
const {
  SectionHeader,
  Card,
  CoinMark,
  Badge,
  Button,
  FilterTabs,
  SearchInput,
  IconButton
} = window.TerminalforDesignSystem_c51d59;
function Transactions({
  data
}) {
  const [tab, setTab] = React.useState('All');
  const list = tab === 'All' ? data.transactions : data.transactions.filter(t => t.kind === tab.replace(/s$/, ''));
  const th = {
    font: 'var(--type-label)',
    fontSize: 'var(--fs-tiny)',
    color: 'var(--text-faint)',
    fontWeight: 'var(--fw-medium)',
    textAlign: 'left',
    padding: '0 var(--sp-6) var(--sp-6)'
  };
  const td = {
    padding: 'var(--sp-6)',
    borderTop: '1px solid var(--border-hairline)',
    whiteSpace: 'nowrap',
    font: 'var(--type-body-sm)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--gap-section)',
      padding: 'var(--sp-9)'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrowIcon: "clock",
    eyebrow: "Last 30 days",
    size: "lg",
    title: "Transactions",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SearchInput, {
      width: 220,
      placeholder: "Search pair...",
      shortcut: null
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "download"
    }, "Statement"))
  }), /*#__PURE__*/React.createElement(Card, {
    variant: "panel",
    padding: "var(--pad-panel)",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--sp-8)'
    }
  }, /*#__PURE__*/React.createElement(FilterTabs, {
    options: ['All', 'Buys', 'Sells', 'Swaps'],
    value: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement(IconButton, {
    icon: "sliders-horizontal",
    size: 30,
    label: "Filter"
  })), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Type"), /*#__PURE__*/React.createElement("th", {
    style: th
  }, "Pair"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Amount"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Total"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Time"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: 'right'
    }
  }, "Status"))), /*#__PURE__*/React.createElement("tbody", null, list.map((t, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: t.kind === 'Sell' ? 'var(--negative)' : t.kind === 'Buy' ? 'var(--positive)' : 'var(--text-accent)',
      fontWeight: 'var(--fw-semibold)'
    }
  }, t.kind)), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--sp-5)'
    }
  }, /*#__PURE__*/React.createElement(CoinMark, {
    symbol: t.symbol,
    size: 22
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--fw-semibold)'
    }
  }, t.pair))), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      font: 'var(--type-numeric-strong)',
      color: 'var(--text-body)'
    }
  }, t.amount), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      fontWeight: 'var(--fw-semibold)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, t.total), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right',
      font: 'var(--type-numeric)',
      color: 'var(--text-faint)'
    }
  }, t.time), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: t.status === 'Filled' ? 'positive' : 'warn'
  }, t.status))))))));
}
Object.assign(window, {
  Transactions
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/terminal/Transactions.jsx", error: String((e && e.message) || e) }); }

// ui_kits/terminal/data.js
try { (() => {
// Fake market data for the Terminalfor UI kit. Figures mirror the source screenshot.
const mk = (seed, n = 24, drift = 1) => {
  const out = [];
  let v = 50;
  for (let i = 0; i < n; i++) {
    v += Math.sin((i + seed) / 2.3) * 6 + Math.cos((i + seed) / 5) * 4 + drift * 1.4;
    out.push(v);
  }
  return out;
};
window.TF_DATA = {
  tickers: [{
    symbol: 'btc',
    price: '104,347.43'
  }, {
    symbol: 'sol',
    price: '$176.34'
  }, {
    symbol: 'ltc',
    price: '$0.2329'
  }, {
    symbol: 'doge',
    price: '$0.22795'
  }, {
    symbol: 'matic',
    price: '$6.54'
  }, {
    symbol: 'uni',
    price: '$6.47'
  }, {
    symbol: 'usdt',
    price: '$1.00'
  }, {
    symbol: 'eth',
    price: '$2,687.63'
  }],
  cards: [{
    symbol: 'btc',
    name: 'Bitcoin',
    pair: 'BTC/USDT',
    price: 109687.6,
    delta: 1.09,
    series: mk(1, 26, 1)
  }, {
    symbol: 'eth',
    name: 'Ethereum',
    pair: 'ETH/USDT',
    price: 2687.63,
    delta: -2.01,
    series: mk(7, 26, -1.2)
  }, {
    symbol: 'sui',
    name: 'Sui',
    pair: 'SUI/USDT',
    price: 178.24,
    delta: 2.10,
    series: mk(3, 26, 1.1)
  }],
  rows: [{
    symbol: 'btc',
    name: 'Bitcoin',
    price: '$102,646.00',
    deltas: [1.24, -0.61, -0.49],
    marketCap: '$2,090,152,416,300',
    volume: '$45,328,211,894',
    series: mk(2, 20, -1)
  }, {
    symbol: 'usdt',
    name: 'Tether',
    price: '1.01',
    deltas: [0.16, 1.28, -0.06],
    marketCap: '$93,584,210,001',
    volume: '$35,672,981,002',
    series: mk(5, 20, 1)
  }, {
    symbol: 'eth',
    name: 'Ethereum',
    price: '$3,529.42',
    deltas: [2.65, -1.16, 4.05],
    marketCap: '$422,138,947,333',
    volume: '$21,784,913,118',
    series: mk(8, 20, 1)
  }, {
    symbol: 'sol',
    name: 'Solana',
    price: '$141.75',
    deltas: [-2.44, 1.06, 4.85],
    marketCap: '$62,386,574,112',
    volume: '$6,235,781,332',
    series: mk(11, 20, -1)
  }, {
    symbol: 'doge',
    name: 'Doge',
    price: '$0.166',
    deltas: [1.05, 1.98, -0.08],
    marketCap: '$22,418,117,444',
    volume: '$2,190,432,225',
    series: mk(13, 20, 1)
  }, {
    symbol: 'sui',
    name: 'Sui',
    price: '$1.29',
    deltas: [-4.03, -2.27, 4.60],
    marketCap: '$1,873,351,834',
    volume: '$509,621,122',
    series: mk(17, 20, -1)
  }, {
    symbol: 'ltc',
    name: 'Litecoin',
    price: '$1.29',
    deltas: [-4.03, 0.63, 4.60],
    marketCap: '$1,873,351,834',
    volume: '$509,621,122',
    series: mk(19, 20, -1)
  }],
  candles: Array.from({
    length: 46
  }, (_, i) => {
    const o = 50 + Math.sin(i / 3.1) * 14 + Math.sin(i / 8) * 9;
    const c = o + (i % 3 === 0 ? 7 : -6) + Math.cos(i / 1.7) * 4;
    return {
      o,
      c,
      h: Math.max(o, c) + 3 + i % 5,
      l: Math.min(o, c) - 3 - i % 4
    };
  }),
  navGroups: [{
    label: 'Overview',
    items: [{
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'layout-grid'
    }]
  }, {
    label: 'Account',
    items: [{
      id: 'portfolio',
      label: 'Portfolio',
      icon: 'candlestick-chart',
      dot: true
    }, {
      id: 'wallet',
      label: 'Wallet',
      icon: 'wallet'
    }, {
      id: 'watchlist',
      label: 'Watchlist',
      icon: 'star'
    }]
  }, {
    label: 'Activity',
    items: [{
      id: 'trade',
      label: 'Trade',
      icon: 'repeat'
    }, {
      id: 'transactions',
      label: 'Transactions',
      icon: 'arrow-left-right'
    }]
  }, {
    label: 'Others',
    items: [{
      id: 'insights',
      label: 'Insights',
      icon: 'lightbulb'
    }, {
      id: 'analytics',
      label: 'Analytics',
      icon: 'bar-chart-3',
      badge: 'Beta'
    }, {
      id: 'trends',
      label: 'Market Trends',
      icon: 'trending-up'
    }]
  }, {
    label: 'Support',
    items: [{
      id: 'support',
      label: 'Support',
      icon: 'life-buoy',
      badge: '2'
    }, {
      id: 'settings',
      label: 'Settings',
      icon: 'settings'
    }]
  }],
  holdings: [{
    symbol: 'btc',
    name: 'Bitcoin',
    amount: '0.8241 BTC',
    value: '$90,412.11',
    delta: 1.09,
    alloc: 46
  }, {
    symbol: 'eth',
    name: 'Ethereum',
    amount: '12.44 ETH',
    value: '$33,434.10',
    delta: -2.01,
    alloc: 24
  }, {
    symbol: 'sol',
    name: 'Solana',
    amount: '184.2 SOL',
    value: '$26,110.35',
    delta: 4.85,
    alloc: 17
  }, {
    symbol: 'usdt',
    name: 'Tether',
    amount: '19,240 USDT',
    value: '$19,240.00',
    delta: 0.01,
    alloc: 13
  }],
  transactions: [{
    kind: 'Buy',
    symbol: 'eth',
    pair: 'ETH/USDT',
    amount: '4.20 ETH',
    total: '$11,288.05',
    time: '15 Jun · 16:09',
    status: 'Filled'
  }, {
    kind: 'Sell',
    symbol: 'btc',
    pair: 'BTC/USDT',
    amount: '0.0140 BTC',
    total: '$1,535.62',
    time: '15 Jun · 14:52',
    status: 'Filled'
  }, {
    kind: 'Swap',
    symbol: 'sol',
    pair: 'SOL/USDT',
    amount: '52.0 SOL',
    total: '$7,371.00',
    time: '14 Jun · 21:04',
    status: 'Filled'
  }, {
    kind: 'Buy',
    symbol: 'doge',
    pair: 'DOGE/USDT',
    amount: '18,400 DOGE',
    total: '$3,054.40',
    time: '14 Jun · 09:31',
    status: 'Pending'
  }, {
    kind: 'Sell',
    symbol: 'usdt',
    pair: 'USDT/USD',
    amount: '2,000 USDT',
    total: '$2,000.00',
    time: '13 Jun · 18:12',
    status: 'Filled'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/terminal/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.DeltaChip = __ds_scope.DeltaChip;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.AssetCard = __ds_scope.AssetCard;

__ds_ns.CandleChart = __ds_scope.CandleChart;

__ds_ns.COIN_COLOR = __ds_scope.COIN_COLOR;

__ds_ns.CoinMark = __ds_scope.CoinMark;

__ds_ns.MarketTable = __ds_scope.MarketTable;

__ds_ns.PriceValue = __ds_scope.PriceValue;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.TickerStrip = __ds_scope.TickerStrip;

__ds_ns.AmountField = __ds_scope.AmountField;

__ds_ns.FilterTabs = __ds_scope.FilterTabs;

__ds_ns.RangeSlider = __ds_scope.RangeSlider;

__ds_ns.SearchInput = __ds_scope.SearchInput;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.SelectMenu = __ds_scope.SelectMenu;

__ds_ns.PromoBanner = __ds_scope.PromoBanner;

__ds_ns.SidebarNav = __ds_scope.SidebarNav;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
