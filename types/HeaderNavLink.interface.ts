export interface HeaderNavLink {
  title: string;
  // Not needed for entries with children, which render as dropdown toggles
  link?: string;
  icon?: string;
  children?: HeaderNavLink[];
  expanded?: boolean;
  mobileOnly?: boolean;
  // Desktop renders this as the pill button after the links; mobile shows it
  // as a normal row
  variant?: "button";
  // Icon colour scheme, matching ButtonPill themes
  theme?: "primary" | "secondary";
  // Short summary shown under the title in the desktop dropdown
  description?: string;
  // Highlighted link along the bottom of the desktop dropdown
  cta?: {
    text: string;
    linkText: string;
    link: string;
  };
}
