import { typography, spacing, type ThemeColors } from "../design-tokens";
import { createScaler, flexColumn, flexRow } from "../styles";

interface HeaderProps {
  year: number;
  colors: ThemeColors;
  scale?: number;
}

export function Header({ year, colors, scale = 1 }: HeaderProps) {
  const s = createScaler(scale);
  return (
    <div style={flexColumn(s(spacing[3]))}>
      <div style={{ ...flexRow(s(spacing[4])), alignItems: "center" }}>
        <span style={{ fontSize: s(typography.size["5xl"]), fontWeight: typography.weight.bold, color: colors.text.primary, letterSpacing: typography.letterSpacing.tight }}>
          ampcode
        </span>
      </div>
      <span style={{ fontSize: s(typography.size["3xl"]), fontWeight: typography.weight.regular, color: colors.text.secondary, marginTop: s(spacing[2]) }}>
        wrapped
        <span style={{ fontWeight: typography.weight.bold, marginLeft: s(spacing[4]), color: colors.accent.primary }}>{year}</span>
      </span>
    </div>
  );
}
