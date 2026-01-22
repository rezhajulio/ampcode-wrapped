import type { ReactNode } from "react";
import { layout, spacing, type ThemeColors } from "../design-tokens";
import { createScaler } from "../styles";

interface CardProps {
  children: ReactNode;
  colors: ThemeColors;
  scale?: number;
  padding?: number;
  radius?: "md" | "lg" | "xl";
  flex?: number;
  gap?: number;
  alignItems?: "center" | "flex-start" | "flex-end";
  justifyContent?: "center" | "space-between" | "space-around" | "flex-start" | "flex-end";
}

export function Card({
  children,
  colors,
  scale = 1,
  padding = spacing[8],
  radius = "lg",
  flex,
  gap,
  alignItems,
  justifyContent,
}: CardProps) {
  const s = createScaler(scale);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.surface,
        borderRadius: s(layout.radius[radius]),
        padding: s(padding),
        ...(flex !== undefined && { flex }),
        ...(gap !== undefined && { gap: s(gap) }),
        ...(alignItems && { alignItems }),
        ...(justifyContent && { justifyContent }),
      }}
    >
      {children}
    </div>
  );
}
