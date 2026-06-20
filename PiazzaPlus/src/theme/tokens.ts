/**
 * Pijaca Plus design tokens — exported from Figma (file XU1ENWLKGIQxMTNQkq3lWg).
 * Snapshot of the live `Colors` variable collection + text styles.
 * Keep in sync via the Figma MCP (get_variable_defs) — do NOT hand-edit hex/sizes elsewhere.
 */

export const colors = {
  // Primary
  primary:         '#2e7d32',
  primaryLight:    '#e8f5e9',
  primaryDark:     '#0f5414',
  primaryDisabled: '#a5d6a7',
  // Semantic
  success:         '#388e3c',
  warning:         '#f59e0b',
  error:           '#ef4444',
  errorDark:       '#b91c1c',
  errorLight:      '#fee2e2',
  // Neutral
  bg:              '#f9fafb',
  surface:         '#ffffff',
  text:            '#1f2937',
  textMuted:       '#4b5563',
  border:          '#e5e7eb',
  // Accent
  accent:          '#f97316',
} as const;

type TypeToken = {
  fontFamily: string;
  fontWeight: '400' | '500' | '600' | '700';
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

// Inter. Map weight -> the loaded font (e.g. Inter_400Regular ... Inter_700Bold).
export const type = {
  title1:   { fontFamily: 'Inter', fontWeight: '700', fontSize: 28, lineHeight: 36, letterSpacing: 0 },
  title2:   { fontFamily: 'Inter', fontWeight: '600', fontSize: 22, lineHeight: 30, letterSpacing: 0 },
  title3:   { fontFamily: 'Inter', fontWeight: '600', fontSize: 20, lineHeight: 26, letterSpacing: 0 },
  headline: { fontFamily: 'Inter', fontWeight: '500', fontSize: 17, lineHeight: 24, letterSpacing: -0.41 },
  body:     { fontFamily: 'Inter', fontWeight: '400', fontSize: 16, lineHeight: 24, letterSpacing: -0.41 },
  subhead:  { fontFamily: 'Inter', fontWeight: '400', fontSize: 15, lineHeight: 22, letterSpacing: -0.24 },
  button:   { fontFamily: 'Inter', fontWeight: '700', fontSize: 16, lineHeight: 20, letterSpacing: 1 }, // Figma = UPPERCASE; prefer sentence case in app (REVIEW W2)
  footnote: { fontFamily: 'Inter', fontWeight: '400', fontSize: 14, lineHeight: 20, letterSpacing: -0.08 },
  caption1: { fontFamily: 'Inter', fontWeight: '500', fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  caption2: { fontFamily: 'Inter', fontWeight: '400', fontSize: 11, lineHeight: 15, letterSpacing: 0.07 },
} as const satisfies Record<string, TypeToken>;

export const radii   = { input: 10, button: 12, card: 12, cardLg: 16, thumb: 8, iconbox: 10, pill: 999 } as const;
export const space   = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, screen: 16 } as const;
export const stroke  = { hair: 1, field: 1.5, focus: 2 } as const; // border widths
export const HIT     = 48;       // minimum touch-target (dp)
export const HIT_SLOP = 48;      // alias

// Bar-chart green ramp (taller = darker), per figma/MEASUREMENTS.md §Charts
export const chartRamp = ['#a5d6a7', '#66bb6a', '#43a047', '#2e7d32', '#1b5e20'] as const;

export type TypeVariant = keyof typeof type;
export type ColorToken = keyof typeof colors;
