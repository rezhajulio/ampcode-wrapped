import { generateWeeksForYear, getIntensityLevel } from "../utils/dates";
import { typography, spacing, components, formatConfigs, type ThemeColors, type LayoutFormat } from "./design-tokens";

interface HeatmapProps {
  dailyActivity: Map<string, number>;
  year: number;
  maxStreakDays?: Set<string>;
  theme: ThemeColors;
  layoutFormat?: LayoutFormat;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getHeatmapColors(theme: ThemeColors) {
  return {
    0: theme.heatmap.empty,
    1: theme.heatmap.level1,
    2: theme.heatmap.level2,
    3: theme.heatmap.level3,
    4: theme.heatmap.level4,
    5: theme.heatmap.level5,
    6: theme.heatmap.level6,
  } as const;
}

function getStreakColors(theme: ThemeColors) {
  return {
    0: theme.streak.empty,
    1: theme.streak.level1,
    2: theme.streak.level2,
    3: theme.streak.level3,
    4: theme.streak.level4,
    5: theme.streak.level5,
    6: theme.streak.level6,
  } as const;
}

export function ActivityHeatmap({ dailyActivity, year, maxStreakDays, theme, layoutFormat = "default" }: HeatmapProps) {
  const weeks = generateWeeksForYear(year);
  const counts = Array.from(dailyActivity.values());
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0;
  const config = formatConfigs[layoutFormat];
  const cellSize = config.heatmapCellSize;
  const cellGap = config.heatmapGap;
  const scale = config.scale;
  const monthLabels = getMonthLabels(weeks, cellSize, cellGap);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: Math.round(spacing[2] * scale) }}>
      <MonthLabelsRow labels={monthLabels} theme={theme} scale={scale} />
      <HeatmapGrid weeks={weeks} dailyActivity={dailyActivity} maxStreakDays={maxStreakDays} maxCount={maxCount} theme={theme} cellSize={cellSize} cellGap={cellGap} />
      <HeatmapLegend theme={theme} scale={scale} />
    </div>
  );
}

function MonthLabelsRow({ labels, theme, scale = 1 }: { labels: { month: number; x: number }[]; theme: ThemeColors; scale?: number }) {
  const s = (v: number) => Math.round(v * scale);
  return (
    <div style={{ display: "flex", flexDirection: "row", position: "relative", height: s(20), marginBottom: s(spacing[1]) }}>
      {labels.map(({ month, x }) => (
        <div
          key={`${month}-${x}`}
          style={{
            position: "absolute",
            left: x,
            fontSize: s(typography.size.sm),
            fontWeight: typography.weight.medium,
            color: theme.text.muted,
            fontFamily: typography.fontFamily.mono,
          }}
        >
          {MONTHS[month]}
        </div>
      ))}
    </div>
  );
}

function HeatmapGrid({ weeks, dailyActivity, maxStreakDays, maxCount, theme, cellSize, cellGap }: { weeks: (string | null)[][]; dailyActivity: Map<string, number>; maxStreakDays?: Set<string>; maxCount: number; theme: ThemeColors; cellSize: number; cellGap: number }) {
  const heatmapColors = getHeatmapColors(theme);
  const streakColors = getStreakColors(theme);

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: cellGap }}>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: cellGap }}>
          {week.map((dateStr, dayIndex) => {
            const count = dateStr ? dailyActivity.get(dateStr) || 0 : 0;
            const intensity = getIntensityLevel(count, maxCount) as keyof typeof heatmapColors;
            const isStreakDay = dateStr && maxStreakDays?.has(dateStr);
            const colorPalette = isStreakDay ? streakColors : heatmapColors;
            const color = colorPalette[intensity];

            return (
              <div
                key={dayIndex}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: dateStr ? color : "transparent",
                  borderRadius: Math.round(cellSize / 6),
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HeatmapLegend({ theme, scale = 1 }: { theme: ThemeColors; scale?: number }) {
  const s = (v: number) => Math.round(v * scale);
  const heatmapColors = getHeatmapColors(theme);

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: s(spacing[2]), marginTop: s(spacing[3]) }}>
      <span style={{ fontSize: s(components.legend.fontSize), fontWeight: typography.weight.medium, color: theme.text.muted, fontFamily: typography.fontFamily.mono }}>
        Less
      </span>
      <div style={{ display: "flex", flexDirection: "row", gap: s(components.legend.gap) }}>
        {(Object.keys(heatmapColors) as unknown as (keyof typeof heatmapColors)[]).map((intensity) => (
          <div key={intensity} style={{ width: s(components.legend.cellSize), height: s(components.legend.cellSize), backgroundColor: heatmapColors[intensity], borderRadius: s(3) }} />
        ))}
      </div>
      <span style={{ fontSize: s(components.legend.fontSize), fontWeight: typography.weight.medium, color: theme.text.muted, fontFamily: typography.fontFamily.mono }}>
        More
      </span>
    </div>
  );
}

function getMonthLabels(weeks: (string | null)[][], cellSize: number, gap: number): { month: number; x: number }[] {
  const labels: { month: number; x: number }[] = [];
  let lastMonth = -1;

  for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
    for (const dateStr of weeks[weekIndex]) {
      if (dateStr) {
        const month = parseInt(dateStr.split("-")[1], 10) - 1;
        if (month !== lastMonth) {
          labels.push({ month, x: weekIndex * (cellSize + gap) });
          lastMonth = month;
        }
        break;
      }
    }
  }

  return labels;
}
