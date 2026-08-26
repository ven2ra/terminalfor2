import * as React from 'react';
export interface FilterTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  options: string[];
  value: string;
  onChange?: (value: string) => void;
}
export declare function FilterTabs(props: FilterTabsProps): JSX.Element;
