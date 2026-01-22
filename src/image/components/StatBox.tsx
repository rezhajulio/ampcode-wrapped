import { typography, components, layout, type ThemeColors } from "../design-tokens";
import { createScaler, flexColumn, flexRow, centerContent } from "../styles";

interface StatBoxProps {
  label: string;
  value: string;
  colors: ThemeColors;
  scale?: number;
}

export function StatBox({ label, value, colors, scale = 1 }: StatBoxProps) {
  const s = createScaler(scale);
  return (
    <div style={{ ...flexColumn(s(components.statBox.gap)), ...centerContent(), backgroundColor: colors.surface, paddingTop: s(components.statBox.padding.y), paddingBottom: s(components.statBox.padding.y), paddingLeft: s(components.statBox.padding.x), paddingRight: s(components.statBox.padding.x), flex: 1, borderRadius: components.statBox.borderRadius }}>
      <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>{label}</span>
      <span style={{ fontSize: s(typography.size["2xl"]), fontWeight: typography.weight.bold, color: colors.text.primary, lineHeight: typography.lineHeight.none }}>{value}</span>
    </div>
  );
}

interface CompactStatBoxProps {
  label: string;
  value: string;
  colors: ThemeColors;
  scale: number;
}

export function CompactStatBox({ label, value, colors, scale }: CompactStatBoxProps) {
  const s = createScaler(scale);
  return (
    <div style={{ ...flexColumn(s(4)), ...centerContent(), backgroundColor: colors.surface, paddingTop: s(12), paddingBottom: s(12), paddingLeft: s(16), paddingRight: s(16), flex: 1, borderRadius: layout.radius.md }}>
      <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>{label}</span>
      <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.bold, color: colors.text.primary, lineHeight: typography.lineHeight.none }}>{value}</span>
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string;
  colors: ThemeColors;
  scale: number;
}

export function MiniStat({ label, value, colors, scale }: MiniStatProps) {
  const s = createScaler(scale);
  return (
    <div style={{ ...flexRow(), justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>{label}</span>
      <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{value}</span>
    </div>
  );
}
