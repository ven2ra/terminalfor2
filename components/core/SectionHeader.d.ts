import * as React from 'react';
export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Small faint line above the title, e.g. "Last update 2 min ago" or "Live Updates". */
  eyebrow?: React.ReactNode;
  /** Lucide slug rendered inside the eyebrow. */
  eyebrowIcon?: string;
  title: React.ReactNode;
  /** Pulse dot before the eyebrow — marks streaming data. */
  live?: boolean;
  /** Right-aligned controls (filters, See all). */
  actions?: React.ReactNode;
  /** lg = 34px page display heading, md = 22px section heading. */
  size?: 'md' | 'lg';
}
export declare function SectionHeader(props: SectionHeaderProps): JSX.Element;
