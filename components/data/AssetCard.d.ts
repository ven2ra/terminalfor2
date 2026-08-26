import * as React from 'react';
/**
 * Watch-tile for a single trading pair.
 * @startingPoint section="Data" subtitle="Price tile with delta chip and glowing sparkline" viewport="700x260"
 */
export interface AssetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Ticker used for the CoinMark and accent tick, e.g. "btc". */
  symbol: string;
  /** Display name, e.g. "Bitcoin". */
  name: string;
  /** Pair eyebrow, e.g. "BTC/USDT". */
  pair: string;
  price: number | string;
  /** Signed 24h percentage — drives chip color, glow and sparkline tone. */
  delta: number;
  /** Sparkline series. */
  series?: number[];
  onMenu?: React.MouseEventHandler<HTMLButtonElement>;
}
export declare function AssetCard(props: AssetCardProps): JSX.Element;
