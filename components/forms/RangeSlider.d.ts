import * as React from 'react';
export interface RangeSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value?: number;
  onChange?: (value: number) => void;
  /** Trailing "62%" readout. */
  showValue?: boolean;
}
export declare function RangeSlider(props: RangeSliderProps): JSX.Element;
