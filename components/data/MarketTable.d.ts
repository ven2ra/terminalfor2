import * as React from 'react';
export interface MarketRow {
  symbol: string; name: string;
  /** Pre-formatted price string, e.g. "$102,646.00". */
  price: string;
  /** Three signed percentages in the order of deltaLabels. */
  deltas: number[];
  /** Pre-formatted market cap, e.g. "$2,090,152,416,300". */
  marketCap: string;
  /** Pre-formatted volume, e.g. "$45,328,211,894". */
  volume: string;
  series?: number[];
}
export interface MarketTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  rows: MarketRow[];
  /** Column headers for the three delta columns. */
  deltaLabels?: string[];
}
export declare function MarketTable(props: MarketTableProps): JSX.Element;
