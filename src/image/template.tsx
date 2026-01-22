import type { AmpStats } from "../types";
import { formatNumber, formatCredits, formatDate } from "../utils/format";
import { getHourlyStats } from "../stats";
import { ActivityHeatmap } from "./heatmap";
import { typography, spacing, layout, formatConfigs, type ThemeColors, type LayoutFormat } from "./design-tokens";
import {
  Header,
  Footer,
  WeeklyBarChart,
  CodingHoursCard,
  SectionTitle,
  Section,
  RankingList,
  ByTheNumbers,
  HeroStatItem,
  StatsGrid,
} from "./components";

interface TemplateProps {
  stats: AmpStats;
  theme: ThemeColors;
  layoutFormat?: LayoutFormat;
}

export function WrappedTemplate({ stats, theme, layoutFormat = "default" }: TemplateProps) {
  const hourlyStats = getHourlyStats(stats.hourlyActivity);
  const colors = theme;
  const config = formatConfigs[layoutFormat];
  
  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: colors.background,
        color: colors.text.primary,
        fontFamily: typography.fontFamily.mono,
        paddingLeft: config.padding.horizontal,
        paddingRight: config.padding.horizontal,
        paddingTop: config.padding.top,
        paddingBottom: config.padding.bottom,
      }}
    >
      <Header year={stats.year} colors={colors} scale={1} />

      <div style={{ marginTop: spacing[12], display: "flex", flexDirection: "row", gap: spacing[16], alignItems: "flex-start" }}>
        <HeroStatItem label="Started" subtitle={formatDate(stats.firstThreadDate)} value={`${stats.daysSinceFirstThread} Days Ago`} colors={colors} scale={1} />
        <HeroStatItem label="Most Active Day" subtitle={stats.weekdayActivity.mostActiveDayName} value={stats.mostActiveDay?.formattedDate ?? "N/A"} colors={colors} scale={1} />
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: colors.surface, borderRadius: layout.radius.lg, padding: spacing[8] }}>
          <SectionTitle colors={colors} scale={1}>Weekly</SectionTitle>
          <WeeklyBarChart weekdayActivity={stats.weekdayActivity} colors={colors} scale={1} />
        </div>
      </div>

      <Section title="Activity" marginTop={spacing[10]} colors={colors} scale={1}>
        <ActivityHeatmap dailyActivity={stats.dailyActivity} year={stats.year} maxStreakDays={stats.maxStreakDays} theme={colors} layoutFormat={layoutFormat} />
      </Section>

      <div style={{ marginTop: spacing[12], display: "flex", flexDirection: "row", gap: spacing[16] }}>
        <RankingList title="Top Tools" items={stats.topTools.map((t) => ({ name: t.name }))} colors={colors} scale={1} />
        <ByTheNumbers stats={stats} colors={colors} scale={1} />
        <CodingHoursCard hourlyStats={hourlyStats} hourlyActivity={stats.hourlyActivity} colors={colors} scale={1} />
      </div>

      <StatsGrid stats={stats} colors={colors} scale={1} />
      <Footer colors={colors} scale={1} />
    </div>
  );
}
