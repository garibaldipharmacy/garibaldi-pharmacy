export interface HeaderNavLink {
  title: string;
  link: string;
  icon?: string;
  children?: HeaderNavLink[];
  expanded?: boolean;
}
