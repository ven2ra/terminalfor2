import * as React from 'react';
export interface AmountFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "Spend" / "Receive". */
  label: string;
  value: string | number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Right-hand node — normally a SelectMenu with a CoinMark. */
  currency?: React.ReactNode;
  readOnly?: boolean;
}
export declare function AmountField(props: AmountFieldProps): JSX.Element;
