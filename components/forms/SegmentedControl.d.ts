import * as React from 'react';
export interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  options: string[];
  value: string;
  onChange?: (value: string) => void;
  /** Stretch segments to fill the container (default true — as in the exchange panel). */
  fullWidth?: boolean;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
