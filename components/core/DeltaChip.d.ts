import * as React from 'react';
export interface DeltaChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Signed percentage as a number, e.g. 1.09 or -2.01. Sign and formatting are derived. */
  value: number;
  /** Prepend a trend arrow glyph (used on asset cards, omitted in table cells). */
  showIcon?: boolean;
  /** sm = 18px for table cells, md = 22px for cards. */
  size?: 'sm' | 'md';
}
export declare function DeltaChip(props: DeltaChipProps): JSX.Element;
