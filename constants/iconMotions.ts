// Each icon moves like the thing it shows when its button is hovered: the
// phone rings, the paper plane takes off, the pill bottle rattles and the
// prescription slides away as if sent. The animations live in assets/main.scss
// and play on the nearest hovered .group
const iconMotions: Record<string, string> = {
  "fa6-solid:phone": "icon-motion--ring",
  "fa6-solid:paper-plane": "icon-motion--take-off",
  "fa6-solid:prescription-bottle": "icon-motion--shake",
  "fa6-solid:prescription": "icon-motion--send",
};

export const iconMotion = (icon?: string) =>
  icon ? iconMotions[icon] : undefined;
