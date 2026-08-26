import * as React from 'react';
export interface NavItem { id: string; label: string; icon: string; badge?: string; dot?: boolean; }
export interface NavGroup { label: string; items: NavItem[]; }
/**
 * The product's left rail.
 * @startingPoint section="Navigation" subtitle="Grouped app rail with greeting and log out" viewport="700x420"
 */
export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Wordmark text — no logo mark was supplied with the brand, so the name is set in type. */
  brand?: string;
  tagline?: string;
  /** Large greeting under the lockup, e.g. "Welcome Back, Jason". */
  greeting?: React.ReactNode;
  /** Faint line under the greeting, e.g. "Last login 15 Jun 2025". */
  meta?: React.ReactNode;
  /** Sections, each with a small uppercase label ("Overview", "Account", "Activity", "Others"). */
  groups: NavGroup[];
  /** Active item id. */
  active?: string;
  onSelect?: (id: string) => void;
  onCollapse?: () => void;
  /** Replaces the default "Log out" row. */
  footer?: React.ReactNode;
}
export declare function SidebarNav(props: SidebarNavProps): JSX.Element;
