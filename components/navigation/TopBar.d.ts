import * as React from 'react';
export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Breadcrumb trail after the home glyph, e.g. ["Overview","Dashboard"]. */
  crumbs?: string[];
  /** Wallet label, e.g. "Your Wallet". */
  wallet?: string;
  /** Truncated address, e.g. "0x00FD...FAB6". */
  address?: string;
  onSearch?: React.ChangeEventHandler<HTMLInputElement>;
}
export declare function TopBar(props: TopBarProps): JSX.Element;
