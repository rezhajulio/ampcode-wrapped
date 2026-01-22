import { typography, spacing, type ThemeColors } from "../design-tokens";
import { createScaler, centerContent } from "../styles";

interface FooterProps {
  colors: ThemeColors;
  scale?: number;
}

export function Footer({ colors, scale = 1 }: FooterProps) {
  const s = createScaler(scale);
  return (
    <div style={{ ...centerContent(), marginTop: s(spacing[12]), gap: s(spacing[6]) }}>
      <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.muted, letterSpacing: typography.letterSpacing.normal }}>ampcode.com</span>
      <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.muted, letterSpacing: typography.letterSpacing.normal }}>•</span>
      <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.muted, letterSpacing: typography.letterSpacing.normal }}>github.com/rezhajulio/ampcode-wrapped</span>
    </div>
  );
}
