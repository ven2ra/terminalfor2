import * as React from 'react';
export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Key hint chip on the right edge. Pass null to hide. */
  shortcut?: string | null;
  width?: number | string;
}
export declare function SearchInput(props: SearchInputProps): JSX.Element;
