import * as React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** accent = violet "Beta" flag. neutral = counts. positive/negative/warn = status. */
  tone?: 'accent' | 'neutral' | 'positive' | 'negative' | 'warn';
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
