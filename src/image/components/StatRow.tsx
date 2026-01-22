import { typography, type ThemeColors } from "../design-tokens";
import { createScaler } from "../styles";

interface StatRowProps {
  label: string;
  value: string | number;
  colors: ThemeColors;
  scale?: number;
}

export function StatRow({ label, value, colors, scale = 1 }: StatRowProps) {
  const s = createScaler(scale);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>{label}</span>
      <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{value}</span>
    </div>
  );
}
