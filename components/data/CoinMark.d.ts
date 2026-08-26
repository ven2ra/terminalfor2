import * as React from 'react';
export interface CoinMarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Ticker symbol, case-insensitive: "btc", "eth", "usdt", "sol", "doge", "ltc", "matic", "uni", "sui". */
  symbol: string;
  /** Diameter in px — 16 inline, 22 table rows, 30 asset cards. */
  size?: number;
  /** Soft halo in the asset's brand color. */
  ring?: boolean;
}
export declare function CoinMark(props: CoinMarkProps): JSX.Element;
export declare const COIN_COLOR: Record<string, string>;
