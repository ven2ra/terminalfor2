export interface Candle { o: number; h: number; l: number; c: number; }
export interface CandleChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Open/high/low/close series, oldest first. 30–60 candles fill a panel. */
  candles: Candle[];
  height?: number;
  /** Px gap between candles (2 default). */
  gap?: number;
}
export declare function CandleChart(props: CandleChartProps): JSX.Element;
