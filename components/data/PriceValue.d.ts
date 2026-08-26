import * as React from 'react';
export interface PriceValueProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number (formatted with 2 decimals) or a pre-formatted string. */
  value: number | string;
  /** Currency prefix, "$" default. Pass "" to omit. */
  currency?: string;
  /** Trailing unit rendered in full-strength text, e.g. "USD". */
  suffix?: string;
  /** lg = 28px hero price, md = 22px, sm = 16px. */
  size?: 'sm' | 'md' | 'lg';
}
export declare function PriceValue(props: PriceValueProps): JSX.Element;
