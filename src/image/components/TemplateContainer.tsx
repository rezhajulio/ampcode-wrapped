import type { ReactNode } from "react";
import { typography, type ThemeColors, type FormatConfig } from "../design-tokens";
import { createScaler } from "../styles";

interface TemplateContainerProps {
  children: ReactNode;
  colors: ThemeColors;
  config: FormatConfig;
  scale?: number;
  justifyContent?: "flex-start" | "space-between";
}

export function TemplateContainer({
  children,
  colors,
  config,
  scale = 1,
  justifyContent = "flex-start",
}: TemplateContainerProps) {
  const s = createScaler(scale);
  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        display: "flex",
        flexDirection: "column",
        justifyContent,
        backgroundColor: colors.background,
        color: colors.text.primary,
        fontFamily: typography.fontFamily.mono,
        paddingLeft: s(config.padding.horizontal),
        paddingRight: s(config.padding.horizontal),
        paddingTop: s(config.padding.top),
        paddingBottom: s(config.padding.bottom),
      }}
    >
      {children}
    </div>
  );
}
