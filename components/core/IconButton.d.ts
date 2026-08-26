import * as React from 'react';
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide slug. */
  icon: string;
  /** Square edge in px — 32 default, 28 in dense rows, 36 in the topbar. */
  size?: number;
  /** inset = hairline tile on --surface-inset. bare = transparent until hover. */
  variant?: 'inset' | 'bare';
  /** Accessible name (required in practice — the control has no text). */
  label?: string;
  /** Violet unread dot in the top-right corner. */
  dot?: boolean;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
