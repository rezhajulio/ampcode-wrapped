export type ThemeName = "dark" | "light";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceBorder: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    disabled: string;
  };
  accent: {
    primary: string;
    primaryHover: string;
    secondary: string;
  };
  heatmap: {
    empty: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
  };
  streak: {
    empty: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
  };
}

const darkColors: ThemeColors = {
  background: "#0A0A0A",
  surface: "#161616",
  surfaceHover: "#1C1C1C",
  surfaceBorder: "#262626",

  text: {
    primary: "#FAFAFA",
    secondary: "#E5E5E5",
    tertiary: "#A3A3A3",
    muted: "#737373",
    disabled: "#525252",
  },

  accent: {
    primary: "#22c55e",
    primaryHover: "#16a34a",
    secondary: "#3B82F6",
  },

  heatmap: {
    empty: "#1A1A1A",
    level1: "#2D2D2D",
    level2: "#424242",
    level3: "#5C5C5C",
    level4: "#7A7A7A",
    level5: "#9E9E9E",
    level6: "#C4C4C4",
  },

  streak: {
    empty: "#0D1A0D",
    level1: "#14532d",
    level2: "#166534",
    level3: "#22c55e",
    level4: "#4ade80",
    level5: "#86efac",
    level6: "#bbf7d0",
  },
};

const lightColors: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  surfaceHover: "#EBEBEB",
  surfaceBorder: "#E0E0E0",

  text: {
    primary: "#171717",
    secondary: "#262626",
    tertiary: "#525252",
    muted: "#737373",
    disabled: "#A3A3A3",
  },

  accent: {
    primary: "#16a34a",
    primaryHover: "#15803d",
    secondary: "#2563EB",
  },

  heatmap: {
    empty: "#F0F0F0",
    level1: "#D4D4D4",
    level2: "#A3A3A3",
    level3: "#737373",
    level4: "#525252",
    level5: "#404040",
    level6: "#262626",
  },

  streak: {
    empty: "#DCFCE7",
    level1: "#BBF7D0",
    level2: "#86EFAC",
    level3: "#4ADE80",
    level4: "#22C55E",
    level5: "#16A34A",
    level6: "#15803D",
  },
};

export const themes: Record<ThemeName, ThemeColors> = {
  dark: darkColors,
  light: lightColors,
};

export const colors = darkColors;

export const typography = {
  fontFamily: {
    mono: "IBM Plex Mono",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 40,
    "3xl": 48,
    "4xl": 56,
    "5xl": 64,
  },
  lineHeight: {
    none: 1,
    tight: 1.15,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.5,
  },
  letterSpacing: {
    tighter: -2,
    tight: -1,
    normal: 0,
    wide: 1,
    wider: 2,
    widest: 4,
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const layout = {
  canvas: {
    width: 1500,
    height: 1700,
  },
  padding: {
    horizontal: 64,
    top: 80,
    bottom: 64,
  },
  content: {
    width: 1372,
  },
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
  },
} as const;

export type LayoutFormat = "default";

export interface FormatConfig {
  width: number;
  height: number;
  padding: { horizontal: number; top: number; bottom: number };
  scale: number;
  heatmapCellSize: number;
  heatmapGap: number;
}

export const formatConfigs: Record<LayoutFormat, FormatConfig> = {
  default: {
    width: 1500,
    height: 1700,
    padding: { horizontal: 64, top: 80, bottom: 64 },
    scale: 1,
    heatmapCellSize: 23.4,
    heatmapGap: 3,
  },
};

export const components = {
  statBox: {
    background: colors.surface,
    borderRadius: layout.radius.lg,
    padding: { x: 32, y: 24 },
    gap: 8,
  },
  card: {
    background: colors.surface,
    borderRadius: layout.radius.lg,
    borderColor: colors.surfaceBorder,
    padding: spacing[6],
  },
  sectionHeader: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: colors.text.tertiary,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: "uppercase" as const,
  },
  heatmapCell: {
    size: 23.4,
    gap: 3,
    borderRadius: layout.radius.sm,
  },
  legend: {
    fontSize: typography.size.xs,
    color: colors.text.muted,
    cellSize: 14,
    gap: 6,
  },
  ranking: {
    numberWidth: 48,
    numberSize: typography.size.xl,
    itemSize: typography.size.lg,
    gap: spacing[4],
  },
} as const;

export const HEATMAP_COLORS = {
  0: colors.heatmap.empty,
  1: colors.heatmap.level1,
  2: colors.heatmap.level2,
  3: colors.heatmap.level3,
  4: colors.heatmap.level4,
  5: colors.heatmap.level5,
  6: colors.heatmap.level6,
} as const;

export const STREAK_COLORS = {
  0: colors.streak.empty,
  1: colors.streak.level1,
  2: colors.streak.level2,
  3: colors.streak.level3,
  4: colors.streak.level4,
  5: colors.streak.level5,
  6: colors.streak.level6,
} as const;
