import * as React from 'react';
/**
 * Action button.
 * @startingPoint section="Core" subtitle="Gradient CTA, secondary, ghost and danger buttons" viewport="700x150"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = violet gradient CTA (one per view). secondary = inset panel fill. ghost = bare text. danger = red tint. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  /** Lucide slug rendered before the label. */
  icon?: string;
  /** Lucide slug rendered after the label — "chevron-right" on CTAs. */
  trailingIcon?: string;
  fullWidth?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
