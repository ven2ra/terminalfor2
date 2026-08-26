import * as React from 'react';
export interface SelectMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  options: string[];
  value: string;
  onChange?: (value: string) => void;
  /** Node before the label — a CoinMark in currency pickers. */
  leading?: React.ReactNode;
  width?: number | string;
}
export declare function SelectMenu(props: SelectMenuProps): JSX.Element;
