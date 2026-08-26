import * as React from 'react';
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** card = --surface-card w/ 16px radius. panel = --surface-panel w/ 20px radius (right column, page sections). inset = nested field group. */
  variant?: 'card' | 'panel' | 'inset';
  /** CSS padding override; defaults to --pad-card (16px). */
  padding?: string | number;
  /** Lift the hairline on hover and show a pointer. */
  interactive?: boolean;
  /** Bottom-anchored radial glow tint behind the content. */
  glow?: 'up' | 'down' | 'accent';
}
export declare function Card(props: CardProps): JSX.Element;
