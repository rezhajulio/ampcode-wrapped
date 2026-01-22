import type { WeekdayActivity } from "../../types";
import { typography, spacing, components, type ThemeColors } from "../design-tokens";
import { createScaler, flexColumn, flexRow } from "../styles";

export const BAR_HEIGHT = 100;
export const BAR_WIDTH = 56;
export const BAR_GAP = 12;
export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOURLY_BAR_HEIGHT = 32;
const HOURLY_BAR_WIDTH = 12;
const HOURLY_BAR_GAP = 4;

interface WeeklyBarChartProps {
  weekdayActivity: WeekdayActivity;
  colors: ThemeColors;
  scale?: number;
}

export function WeeklyBarChart({ weekdayActivity, colors, scale = 1 }: WeeklyBarChartProps) {
  const { counts, mostActiveDay, maxCount } = weekdayActivity;
  const s = createScaler(scale);
  const scaledBarHeight = s(BAR_HEIGHT);
  const scaledBarWidth = s(BAR_WIDTH);
  const scaledBarGap = s(BAR_GAP);

  return (
    <div style={flexColumn(s(spacing[2]))}>
      <div style={{ ...flexRow(scaledBarGap), alignItems: "flex-end", height: scaledBarHeight }}>
        {counts.map((count, i) => {
          const heightPercent = maxCount > 0 ? count / maxCount : 0;
          const barHeight = Math.max(s(8), Math.round(heightPercent * scaledBarHeight));
          const isHighlighted = i === mostActiveDay;

          return <div key={i} style={{ width: scaledBarWidth, height: barHeight, backgroundColor: isHighlighted ? colors.accent.primary : colors.heatmap.level2, borderRadius: s(4) }} />;
        })}
      </div>
      <div style={flexRow(scaledBarGap)}>
        {WEEKDAY_LABELS.map((label, i) => {
          const isHighlighted = i === mostActiveDay;
          return (
            <div key={i} style={{ width: scaledBarWidth, display: "flex", justifyContent: "center", fontSize: s(typography.size.sm), fontWeight: isHighlighted ? typography.weight.bold : typography.weight.regular, color: isHighlighted ? colors.accent.primary : colors.text.muted }}>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CodingHoursCardProps {
  hourlyStats: { peakHour: number; peakPeriod: string; peakPeriodEmoji: string };
  hourlyActivity: number[];
  colors: ThemeColors;
  scale?: number;
}

export function CodingHoursCard({ hourlyStats, hourlyActivity, colors, scale = 1 }: CodingHoursCardProps) {
  const s = createScaler(scale);
  const twoHourBlocks: number[] = [];
  for (let i = 0; i < 24; i += 2) {
    twoHourBlocks.push(hourlyActivity[i] + hourlyActivity[i + 1]);
  }
  const maxBlock = Math.max(...twoHourBlocks);
  const peakBlockIndex = Math.floor(hourlyStats.peakHour / 2);
  const scaledBarHeight = s(HOURLY_BAR_HEIGHT);
  const scaledBarWidth = s(HOURLY_BAR_WIDTH);
  const scaledBarGap = s(HOURLY_BAR_GAP);

  return (
    <div style={{ ...flexColumn(s(spacing[5])), padding: s(spacing[2]) }}>
      <span style={{ fontSize: s(components.sectionHeader.fontSize), fontWeight: components.sectionHeader.fontWeight, color: colors.text.tertiary, letterSpacing: components.sectionHeader.letterSpacing, textTransform: components.sectionHeader.textTransform }}>
        Coding Hours
      </span>
      <div style={flexColumn(s(spacing[4]))}>
        <div style={flexColumn()}>
          <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Peak Hour</span>
          <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{hourlyStats.peakHour}:00 - {(hourlyStats.peakHour + 1) % 24}:00</span>
        </div>
        <div style={flexColumn()}>
          <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Peak Period</span>
          <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{hourlyStats.peakPeriod}</span>
        </div>
        <div style={flexColumn(s(spacing[1]))}>
          <div style={{ ...flexRow(scaledBarGap), alignItems: "flex-end", height: scaledBarHeight }}>
            {twoHourBlocks.map((val, i) => {
              const heightPercent = maxBlock > 0 ? val / maxBlock : 0;
              const barHeight = Math.max(2, Math.round(heightPercent * scaledBarHeight));
              const isPeak = i === peakBlockIndex;
              return <div key={i} style={{ width: scaledBarWidth, height: barHeight, backgroundColor: isPeak ? colors.accent.primary : colors.heatmap.level2, borderRadius: s(2) }} />;
            })}
          </div>
          <div style={{ ...flexRow(), justifyContent: "space-between", width: (scaledBarWidth * 12) + (scaledBarGap * 11) }}>
            <span style={{ fontSize: s(typography.size.xs), color: colors.text.muted }}>0</span>
            <span style={{ fontSize: s(typography.size.xs), color: colors.text.muted }}>12</span>
            <span style={{ fontSize: s(typography.size.xs), color: colors.text.muted }}>24</span>
          </div>
        </div>
      </div>
    </div>
  );
}


