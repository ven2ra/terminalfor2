import * as React from 'react';
export interface PromoBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Offer copy, e.g. "Get 2.5% off fees for next". */
  children?: React.ReactNode;
  /** Monospace timer, e.g. "16:09:46". */
  countdown?: string;
}
export declare function PromoBanner(props: PromoBannerProps): JSX.Element;
