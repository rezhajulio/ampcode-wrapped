import type { AmpStats } from "../../types";
import { formatNumber, formatCredits } from "../../utils/format";
import { spacing, type ThemeColors } from "../design-tokens";
import { createScaler, flexColumn, flexRow } from "../styles";
import { StatBox } from "./StatBox";

interface StatsGridProps {
  stats: AmpStats;
  colors: ThemeColors;
  scale?: number;
}

export function StatsGrid({ stats, colors, scale = 1 }: StatsGridProps) {
  const s = createScaler(scale);
  const cliCount = stats.clientUsage.get("cli") || 0;
  const ideCount = (stats.clientUsage.get("vscode") || 0) + (stats.clientUsage.get("cursor") || 0);
  const topClient = ideCount > cliCount ? "IDE" : "CLI";

  return (
    <div style={{ ...flexColumn(s(spacing[5])), marginTop: "auto" }}>
      <div style={flexRow(s(spacing[5]))}>
        <StatBox label="Threads" value={formatNumber(stats.totalThreads)} colors={colors} scale={scale} />
        <StatBox label="Messages" value={formatNumber(stats.totalMessages)} colors={colors} scale={scale} />
        <StatBox label="Tokens" value={formatNumber(stats.totalTokens)} colors={colors} scale={scale} />
      </div>
      <div style={flexRow(s(spacing[5]))}>
        <StatBox label="Projects" value={formatNumber(stats.totalProjects)} colors={colors} scale={scale} />
        <StatBox label="Streak" value={`${stats.maxStreak}d`} colors={colors} scale={scale} />
        <StatBox label="Top Client" value={topClient} colors={colors} scale={scale} />
        <StatBox label="Credits" value={formatCredits(stats.totalCredits)} colors={colors} scale={scale} />
      </div>
    </div>
  );
}
