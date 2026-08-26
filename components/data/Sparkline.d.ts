import * as React from 'react';
export interface SparklineProps extends React.SVGAttributes<SVGSVGElement> {
  /** Series values in order; scaled to fit. 20–60 points reads best. */
  points: number[];
  width?: number;
  height?: number;
  /** accent = violet (neutral/portfolio), up = green, down = red. Match the row's delta sign. */
  tone?: 'accent' | 'up' | 'down';
  /** Indices to mark with a white dot. */
  markers?: number[];
}
export declare function Sparkline(props: SparklineProps): JSX.Element;
