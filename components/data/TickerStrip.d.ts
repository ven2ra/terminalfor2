import * as React from 'react';
export interface TickerItem { symbol: string; price: string; quote?: string; }
export interface TickerStripProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TickerItem[];
}
export declare function TickerStrip(props: TickerStripProps): JSX.Element;
