import { typography, spacing, layout, type ThemeColors } from "../design-tokens";
import { createScaler, cardStyle } from "../styles";
import { BAR_HEIGHT } from "./Charts";
import { SectionTitle } from "./Sections";

export const HERO_STAT_CONTENT_HEIGHT = BAR_HEIGHT + spacing[2] + 50;

interface HeroStatItemProps {
  label: string;
  subtitle?: string;
  value: string;
  colors: ThemeColors;
  scale?: number;
}

export function HeroStatItem({ label, subtitle, value, colors, scale = 1 }: HeroStatItemProps) {
  const s = createScaler(scale);
  const scaledHeight = s(HERO_STAT_CONTENT_HEIGHT) + s(spacing[8]) * 2;
  return (
    <div style={{ ...cardStyle(colors, s(spacing[8]), layout.radius.lg), justifyContent: "space-between", height: scaledHeight }}>
      <SectionTitle colors={colors} scale={scale}>{label}</SectionTitle>
      {subtitle && <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.medium, color: colors.text.tertiary }}>{subtitle}</span>}
      <span style={{ fontSize: s(typography.size["4xl"]), fontWeight: typography.weight.medium, color: colors.text.primary, lineHeight: typography.lineHeight.none }}>{value}</span>
    </div>
  );
}
