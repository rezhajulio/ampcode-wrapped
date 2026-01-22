import type { CSSProperties } from "react";
import { layout, type ThemeColors } from "./design-tokens";

/**
 * Creates a scaler function for responsive sizing.
 * @param scale - The scale factor to apply
 * @returns A function that scales numeric values
 * @example
 * const s = createScaler(0.65);
 * s(16) // returns 10
 */
export function createScaler(scale: number): (v: number) => number {
  return (v: number) => Math.round(v * scale);
}

/**
 * Returns flex row style object.
 * @param gap - Optional gap between items
 * @returns CSSProperties for a flex row layout
 * @example
 * <div style={flexRow(16)}>...</div>
 */
export function flexRow(gap?: number): CSSProperties {
  return {
    display: "flex",
    flexDirection: "row",
    ...(gap !== undefined && { gap }),
  };
}

/**
 * Returns flex column style object.
 * @param gap - Optional gap between items
 * @returns CSSProperties for a flex column layout
 * @example
 * <div style={flexColumn(8)}>...</div>
 */
export function flexColumn(gap?: number): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    ...(gap !== undefined && { gap }),
  };
}

/**
 * Returns centered flex styling.
 * @returns CSSProperties for centered content
 * @example
 * <div style={centerContent()}>...</div>
 */
export function centerContent(): CSSProperties {
  return {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
}

/**
 * Returns common card styling with theme colors.
 * @param colors - Theme colors object
 * @param padding - Optional padding value
 * @param borderRadius - Optional border radius value
 * @returns CSSProperties for a card component
 * @example
 * <div style={cardStyle(theme, 24)}>...</div>
 */
export function cardStyle(
  colors: ThemeColors,
  padding?: number,
  borderRadius: number = layout.radius.lg
): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.surface,
    borderRadius,
    ...(padding !== undefined && { padding }),
  };
}
