# Terminalfor — Design System

Dark, dense, data-first design language for **Terminalfor**, an AI-powered crypto trading terminal.
The product is a single web application: a fixed left rail, a global price ticker, a live market
dashboard, and a persistent exchange panel where trades are composed.

## Sources given

| Source | What it contained |
| --- | --- |
| `uploads/Instagram.jfif` (copied to `assets/reference/terminal-dashboard-reference.jfif`) | One 736×920 marketing shot of the trading dashboard at ~1440px design width: rail, topbar, ticker, three live asset cards, "Market Overview" ledger, and the Exchange / Total Transaction right column. The in-shot product chrome reads "Quantix · AI-Powered Trading"; per the brief the system is branded **Terminalfor**. |

No codebase, Figma file, font binaries, logo files, decks or written copy were provided. **Everything
in this system was derived from that single image**, so values are measured/inferred rather than
lifted from source — see *Known gaps* at the bottom before trusting any exact number.

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | Global entry point — `@import` list only. Consumers link this one file. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `motion.css`. |
| `components/core/` | `Icon`, `Button`, `IconButton`, `Badge`, `DeltaChip`, `Card`, `SectionHeader` |
| `components/forms/` | `SearchInput`, `SelectMenu`, `SegmentedControl`, `FilterTabs`, `AmountField`, `RangeSlider` |
| `components/data/` | `CoinMark`, `PriceValue`, `Sparkline`, `CandleChart`, `AssetCard`, `MarketTable`, `TickerStrip` |
| `components/navigation/` | `SidebarNav`, `TopBar`, `PromoBanner` |
| `ui_kits/terminal/` | Interactive recreation of the trading terminal — open `ui_kits/terminal/index.html`. |
| `guidelines/` | Foundation specimen cards (colors, type, spacing, radii, elevation, motion, brand). |
| `assets/reference/` | The original source screenshot, kept for provenance. |
| `thumbnail.html` | Homepage tile. |
| `SKILL.md` | Agent-skill wrapper for use outside this project. |

Each component directory also carries `<Name>.d.ts` (props contract) and `<Name>.prompt.md`
(what/when + usage), plus one `@dsCard` HTML showing its states.

### Intentional additions
- **`Icon`** — the source uses a Lucide-style line set but ships no icon files. `Icon` wraps the
  Lucide CDN as a `currentColor` mask so glyphs inherit text color. Substitution flagged below.
- **`CoinMark`** — token logos are real brand marks and must never be redrawn; this pulls them from
  the `cryptocurrency-icons` CDN.

---

## CONTENT FUNDAMENTALS

**Voice.** Instrument-panel plain. The interface states facts and current values; it does not
persuade, explain, or cheer. Copy is short enough to scan while numbers are moving.

**Casing.** Title Case for headings and nav (`Live Crypto Updates`, `Market Overview`, `Market
Trends`, `Top Gainers`). Sentence case for helper lines (`Advanced trading tool`). 10px eyebrow
labels are Title Case in the product (`Price`, `Spend`, `Receive`, `Wallet balance`, `Total
Transaction`, `Gas fee`) — set them tracked at `--ls-label`; ALL-CAPS is acceptable only for
standalone metadata like `AI-POWERED TRADING`. Ticker symbols are always uppercase with a
lowercase-weight quote (`BTC` bright, `/USDT` faint).

**Person.** Second person, possessive, used sparingly: `Your Wallet`, `Welcome Back, Jason`. Never
"I", never "we". The system never speaks as a personality — even the AI positioning appears only as
the tagline, never as chat-style copy.

**Length.** Labels 1–2 words. Headings 2–4 words. Helper sentences under 8 words. Section eyebrows
carry freshness, not marketing: `Last update 2 min ago`, `Live Updates`, `Last login 15 Jun 2025`.

**Numbers are the copy.** Prices keep their full precision (`$109,687.6`, `$2,687.63`,
`$0.22795`); market caps and volumes stay fully expanded with thousands separators
(`$2,090,152,416,300`) rather than being abbreviated to `2.09T`. Deltas always carry an explicit
sign and two decimals (`+1.09%`, `−2.01%`). Timers are `HH:MM:SS`. Addresses truncate mid-string
(`0x00FD...FAB6`).

**Buttons** are verb + object, no punctuation: `Buy ETH`, `Log out`, `See all`, `Enter terminal`.
Filters are bare nouns: `All`, `Trends`, `Favorites`, `Top Gainers`, `Top Losers`.

**Emoji: never.** Not in copy, not in labels, not as icons. Unicode is used only as functional
punctuation — `/` between breadcrumb and pair segments, `·` as a metadata separator, `#` before a
rank, `%` and `$` as units.

**Tone examples**
- ✅ `Get 2.5% off fees for next` + `16:09:46`
- ✅ `Advanced trading tool`
- ✅ `-12% From Previous Month`
- ❌ `🚀 Crypto is mooning! Don't miss out!!`
- ❌ `We think you'll love our new AI insights engine`

---

## VISUAL FOUNDATIONS

**Overall.** A matte, near-black instrument panel. Depth comes from four steps of nearly-black
surface plus 6–9% white hairlines — never from drop shadows or glassy panels. Color is rationed:
violet for action, green/red for market direction, token brand colors as tiny accents. Everything
else is grey.

**Color.** Shell `#050608` → rail `#07080b` → panel `#0b0d10` → card `#0e1013` → inset `#12151a`
→ raised `#171a20`. Text runs `#f4f5f7` (titles, prices) → `#b7bcc7` (body) → `#8b90a0` (nav,
secondary) → `#5b6070` (eyebrows, units). One hero accent, violet `#6b5cff`, appears on the primary
CTA, the allocation slider, the selected filter pill and the `Beta` badge — nowhere else. Semantic
green `#4ade80` / red `#fb7185` always sit on 13%-opacity tints, never solid fills; solid
`#22c55e`/`#ef4444` are reserved for chart strokes and candles. Magenta `#ff2d6f` exists solely as
the promo strip's pulse dot. Never introduce a new hue: pick from `tokens/colors.css`.

**Type.** One family for the whole UI, a geometric grotesque with a tall x-height, set tight:
display/headings at `−3%` tracking and 1.05–1.2 leading, body at `−0.5%`. Weight does the
hierarchy work (800/700 display, 600 emphasis, 500 labels, 400 body). Numbers in ledger columns
switch to a mono face with `+4%` tracking so digits align; all numerals are `tabular-nums`. The
signature move: hero prices render significant digits in `--text-primary` and the last three
characters in `--n-400` (`$109,`**`687.6`**).

**Spacing & layout.** 2px base scale; 8 / 12 / 16 / 24 carry everything. Fixed frame: 212px rail
(64px collapsed), 52px topbar, 34px full-bleed ticker, 296px exchange column, 24px page gutters,
16px card gaps, 44px table rows. The rail and topbar are sticky; the ticker is the only full-bleed
element. Content is a single flexible column between two fixed columns — never centred, never
max-width constrained.

**Backgrounds.** No photography, no illustration, no repeating pattern, no texture, no grain. The
only non-flat fills are four gradients: the violet CTA (`--gradient-cta`), the white-to-transparent
active nav wash, the magenta-to-transparent promo strip, and bottom-anchored radial glows
(`--glow-up` / `--glow-down` / `--glow-accent`) that sit under sparklines inside cards.

**Charts.** Sparklines: 1.5px stroke, vertical fade to zero underneath, no axes/grid/labels,
optional white 2.5px dot markers on a highlighted point. Candles: 1px wicks at 55% opacity, solid
bodies, green up / red down, no gridlines. Chart tone must always agree with the delta sign shown
beside it.

**Cards.** `--surface-card`, 16px radius, 1px 6% white hairline, 16px padding, no shadow. Panels use
`--surface-panel` at 20px radius and 20px padding. Nested field groups use `--surface-inset` at
12px. A card's only accent is a 3px vertical token-colored tick beside the `Price` label. No
colored left borders across a whole card.

**Borders & radii.** Hairlines only, 6% default / 9% on hover and popovers / 14% for emphasis.
Radii: 4 (kbd, badge) · 6 (menu row) · 10 (button, field) · 12 (inset group) · 16 (card) · 20
(panel) · pill (chips only). Circles for coin marks and the swap handle.

**Shadows.** The UI is deliberately shadowless. `--shadow-popover` is for dropdowns,
`--shadow-cta-glow` appears only on primary-button hover, `--shadow-focus` is a 3px violet 35% ring.
Nothing else casts.

**Transparency & blur.** Transparency is used for structure (white at 4.5–14%) and for semantic
tints (13%), never for frosted panels. Blur tokens exist for a modal scrim only; the shell itself is
opaque. No glassmorphism.

**Motion.** Fast and unshowy: 120ms hover, 180ms enter, 260ms panel, `cubic-bezier(.4,0,.2,1)`.
Streaming values flash their tint for ~600ms rather than sliding or counting up. No bounce, no
spring, no parallax, no entrance choreography — the data moves, the layout does not.

**States.** Hover = +4.5% white wash (rows, ghost buttons) or one surface step up (tiles, dropdown
triggers); secondary buttons brighten 1.35×; the primary CTA gains its glow. Press = `scale(.985)`,
no color change. Focus = the violet ring; never remove it. Disabled = 38% opacity, no cursor.
Selected = violet tint + violet hairline (filters), or the white gradient pill (rail).

**Imagery.** There is none, and that is the rule. If a marketing surface ever needs imagery, it
should be cool-toned, near-black, high-contrast screen capture of the product itself — never stock
photography, never gradient art, never AI-generated illustration.

---

## ICONOGRAPHY

- **Set:** thin monoline glyphs, ~1.5–2px optical stroke, rounded joins, no fills, no duotone.
  The source ships no icon files, so this system uses **Lucide** (`lucide-static@0.451.0` via
  jsDelivr) as the closest match to the screenshot's glyphs. **This is a substitution — flagged.**
- **Delivery:** `Icon` renders the Lucide SVG as a CSS mask filled with `currentColor`, so a glyph
  always matches the text color of its row. No inline hand-drawn SVG exists anywhere in this system,
  and none should be added.
- **Sizes:** 16px in the rail and panels, 14px in dense table cells, 12–13px inside chips and
  eyebrows, 11px for the sort carets.
- **Vocabulary observed in the product:** `layout-grid` (Dashboard), `candlestick-chart`
  (Portfolio), `wallet`, `star` (Watchlist), `repeat` (Trade), `arrow-left-right` (Transactions),
  `lightbulb` (Insights), `bar-chart-3` (Analytics), `trending-up` (Market Trends), `life-buoy`
  (Support), `settings`, `log-out`, `home`, `search`, `bell`, `message-square`, `copy`,
  `chevron-left/right/down`, `chevrons-up-down` (sortable column), `ellipsis-vertical` (card
  overflow), `maximize-2` (expand panel), `arrow-up-down` (swap), `scan-line`, `clock`,
  `sliders-horizontal`, `download`, `shield-check`.
- **Token marks are not icons.** BTC/ETH/USDT/SOL/DOGE/LTC/MATIC/UNI/SUI are real brand marks and
  come from the `cryptocurrency-icons@0.18.1` CDN through `CoinMark`. Never substitute a line glyph,
  a letter, or an emoji for a token.
- **Emoji: never used.** Unicode is used only as punctuation (`/`, `·`, `#`, `%`, `$`).
- **No logo mark exists.** Wherever a mark would go, set the wordmark in type (see
  `guidelines/brand-wordmark.html`).

---

## Known gaps / flags

1. **Fonts substituted.** No binaries were supplied. Core face = **Plus Jakarta Sans** (Google
   Fonts), ledger face = **JetBrains Mono**. The screenshot's letterforms are closer to
   Satoshi/General Sans. **Please send the real font files** and `tokens/fonts.css` becomes exact.
2. **Icons substituted.** Lucide via CDN, per above. If Terminalfor has its own icon set, drop the
   SVGs into `assets/icons/` and repoint `Icon`.
3. **No logo.** None was provided and none was invented.
4. **Colors are sampled from a compressed screenshot.** Hexes are close but not authoritative.
5. **Only one product surface is documented.** Dashboard + exchange panel are recreated faithfully.
   `Portfolio`, `Transactions` and `SignIn` in the UI kit are explicitly marked extrapolations built
   only from documented patterns; Trade, Wallet, Watchlist, Insights, Analytics, Market Trends,
   Support and Settings are intentionally left blank in-app rather than invented.
6. **Brand name mismatch.** The reference chrome says "Quantix"; the system is named Terminalfor as
   briefed. Confirm which is correct.
