import * as React from 'react';
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon slug, e.g. "wallet", "trending-up", "layout-grid". */
  name: string;
  /** Square size in px. 14 for dense rows, 16 default, 18 in the rail. */
  size?: number;
  /** Override color; defaults to currentColor. */
  color?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
