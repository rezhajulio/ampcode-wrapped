import type { AmpStats } from "../types";
import { formatNumber, formatCredits, formatDate } from "../utils/format";
import { getHourlyStats } from "../stats";
import { ActivityHeatmap } from "./heatmap";
import { typography, spacing, layout, formatConfigs, type ThemeColors, type LayoutFormat } from "./design-tokens";
import {
  Header,
  Footer,
  StatBox,
  CompactStatBox,
  MiniStat,
  WeeklyBarChart,
  CodingHoursCard,
  SquareHourlyChart,
  StoryCodingHoursChart,
  BAR_GAP,
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
  const scale = config.scale;

  if (layoutFormat === "square") {
    return <SquareTemplate stats={stats} theme={colors} config={config} scale={scale} hourlyStats={hourlyStats} />;
  }

  if (layoutFormat === "story") {
    return <StoryTemplate stats={stats} theme={colors} config={config} scale={scale} hourlyStats={hourlyStats} />;
  }
  
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

function SquareTemplate({ stats, theme, config, scale, hourlyStats }: { stats: AmpStats; theme: ThemeColors; config: typeof formatConfigs.square; scale: number; hourlyStats: ReturnType<typeof getHourlyStats> }) {
  const colors = theme;
  const s = (v: number) => Math.round(v * scale);

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
      <Header year={stats.year} colors={colors} scale={scale} />

      <div style={{ marginTop: s(spacing[6]), display: "flex", flexDirection: "row", gap: s(spacing[4]) }}>
        <CompactStatBox label="Threads" value={formatNumber(stats.totalThreads)} colors={colors} scale={scale} />
        <CompactStatBox label="Messages" value={formatNumber(stats.totalMessages)} colors={colors} scale={scale} />
        <CompactStatBox label="Tokens" value={formatNumber(stats.totalTokens)} colors={colors} scale={scale} />
        <CompactStatBox label="Streak" value={`${stats.maxStreak}d`} colors={colors} scale={scale} />
      </div>

      <div style={{ marginTop: s(spacing[8]), display: "flex", flexDirection: "column", gap: s(spacing[4]), alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", alignSelf: "flex-start" }}>
          <SectionTitle colors={colors} scale={scale}>Activity</SectionTitle>
        </div>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <ActivityHeatmap dailyActivity={stats.dailyActivity} year={stats.year} maxStreakDays={stats.maxStreakDays} theme={colors} layoutFormat="square" />
        </div>
      </div>

      <div style={{ marginTop: s(spacing[2]), display: "flex", flexDirection: "row", gap: s(spacing[4]), flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.lg), padding: s(spacing[4]) }}>
          <SectionTitle colors={colors} scale={scale}>Top Tools</SectionTitle>
          <div style={{ display: "flex", flexDirection: "row", gap: s(spacing[4]), flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1 }}>
              {stats.topTools.slice(0, 3).map((tool, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: s(spacing[2]) }}>
                  <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.bold, color: colors.text.tertiary, width: s(16), textAlign: "right" }}>{i + 1}</span>
                  <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.medium, color: colors.text.primary }}>{truncate(tool.name, 12)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1 }}>
              {stats.topTools.slice(3, 6).map((tool, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: s(spacing[2]) }}>
                  <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.bold, color: colors.text.tertiary, width: s(16), textAlign: "right" }}>{i + 4}</span>
                  <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.medium, color: colors.text.primary }}>{truncate(tool.name, 12)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.lg), padding: s(spacing[4]) }}>
          <SectionTitle colors={colors} scale={scale}>Stats</SectionTitle>
          <div style={{ display: "flex", flexDirection: "row", gap: s(spacing[4]), flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1 }}>
              <MiniStat label="Projects" value={formatNumber(stats.totalProjects)} colors={colors} scale={scale} />
              <MiniStat label="Peak Hour" value={`${hourlyStats.peakHour}:00`} colors={colors} scale={scale} />
              <MiniStat label="Credits" value={formatCredits(stats.totalCredits)} colors={colors} scale={scale} />
              <MiniStat label="Avg/Thread" value={`${Math.round(stats.totalMessages / Math.max(1, stats.totalThreads))} msgs`} colors={colors} scale={scale} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1 }}>
              <MiniStat label="Input" value={formatNumber(stats.totalInputTokens)} colors={colors} scale={scale} />
              <MiniStat label="Output" value={formatNumber(stats.totalOutputTokens)} colors={colors} scale={scale} />
              <MiniStat label="Best Day" value={stats.weekdayActivity.mostActiveDayName.slice(0, 3)} colors={colors} scale={scale} />
              <MiniStat label="Top Client" value={(() => { const cli = stats.clientUsage.get("cli") || 0; const ide = (stats.clientUsage.get("vscode") || 0) + (stats.clientUsage.get("cursor") || 0); return ide > cli ? "IDE" : "CLI"; })()} colors={colors} scale={scale} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.lg), padding: s(spacing[4]) }}>
          <SectionTitle colors={colors} scale={scale}>Coding Hours</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <SquareHourlyChart hourlyActivity={stats.hourlyActivity} peakHour={hourlyStats.peakHour} colors={colors} scale={scale} />
          </div>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: s(spacing[2]) }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: s(typography.size.xs), color: colors.text.tertiary }}>Peak</span>
              <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{hourlyStats.peakHour}:00</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: s(typography.size.xs), color: colors.text.tertiary }}>Period</span>
              <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{hourlyStats.peakPeriod}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: s(spacing[4]), display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: s(spacing[6]) }}>
        <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.muted, letterSpacing: typography.letterSpacing.normal }}>ampcode.com</span>
      </div>
    </div>
  );
}

function StoryTemplate({ stats, theme, config, scale, hourlyStats }: { stats: AmpStats; theme: ThemeColors; config: typeof formatConfigs.story; scale: number; hourlyStats: ReturnType<typeof getHourlyStats> }) {
  const colors = theme;
  const s = (v: number) => Math.round(v * scale);

  const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;
  const inputPct = totalTokens > 0 ? Math.round((stats.totalInputTokens / totalTokens) * 100) : 0;
  const outputPct = 100 - inputPct;
  const avgMessagesPerThread = stats.totalThreads > 0 ? Math.round(stats.totalMessages / stats.totalThreads) : 0;

  const cliCount = stats.clientUsage.get("cli") || 0;
  const ideCount = (stats.clientUsage.get("vscode") || 0) + (stats.clientUsage.get("cursor") || 0);
  const topClient = ideCount > cliCount ? "IDE" : "CLI";

  return (
    <div
      style={{
        width: config.width,
        height: config.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: colors.background,
        color: colors.text.primary,
        fontFamily: typography.fontFamily.mono,
        paddingLeft: s(80),
        paddingRight: s(80),
        paddingTop: s(100),
        paddingBottom: s(80),
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s(spacing[2]) }}>
        <span style={{ fontSize: s(typography.size["5xl"]), fontWeight: typography.weight.bold, color: colors.text.primary, letterSpacing: typography.letterSpacing.tight }}>
          ampcode
        </span>
        <span style={{ fontSize: s(typography.size["3xl"]), fontWeight: typography.weight.regular, color: colors.text.secondary }}>
          wrapped
          <span style={{ fontWeight: typography.weight.bold, marginLeft: s(spacing[4]), color: colors.accent.primary }}>{stats.year}</span>
        </span>
      </div>

      {/* Hero Row: Started Days | Max Streak */}
      <div style={{ marginTop: s(spacing[14]), display: "flex", flexDirection: "row", gap: s(spacing[6]) }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[8]), gap: s(spacing[4]) }}>
          <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>Started</span>
          <span style={{ fontSize: s(typography.size["4xl"]), fontWeight: typography.weight.bold, color: colors.accent.primary, lineHeight: typography.lineHeight.none }}>{stats.daysSinceFirstThread}</span>
          <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.secondary }}>Days Ago</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[8]), gap: s(spacing[4]) }}>
          <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>Max Streak</span>
          <span style={{ fontSize: s(typography.size["4xl"]), fontWeight: typography.weight.bold, color: colors.accent.primary, lineHeight: typography.lineHeight.none }}>{stats.maxStreak}</span>
          <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.secondary }}>Days</span>
        </div>
      </div>

      {/* Stats Row: Threads | Messages | Tokens */}
      <div style={{ marginTop: s(spacing[12]), display: "flex", flexDirection: "row", gap: s(spacing[4]) }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.lg), paddingTop: s(spacing[5]), paddingBottom: s(spacing[5]), paddingLeft: s(spacing[4]), paddingRight: s(spacing[4]), alignItems: "center", gap: s(spacing[2]) }}>
          <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>Threads</span>
          <span style={{ fontSize: s(typography.size["2xl"]), fontWeight: typography.weight.bold, color: colors.text.primary }}>{formatNumber(stats.totalThreads)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.lg), paddingTop: s(spacing[5]), paddingBottom: s(spacing[5]), paddingLeft: s(spacing[4]), paddingRight: s(spacing[4]), alignItems: "center", gap: s(spacing[2]) }}>
          <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>Messages</span>
          <span style={{ fontSize: s(typography.size["2xl"]), fontWeight: typography.weight.bold, color: colors.text.primary }}>{formatNumber(stats.totalMessages)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.lg), paddingTop: s(spacing[5]), paddingBottom: s(spacing[5]), paddingLeft: s(spacing[4]), paddingRight: s(spacing[4]), alignItems: "center", gap: s(spacing[2]) }}>
          <span style={{ fontSize: s(typography.size.sm), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>Tokens</span>
          <span style={{ fontSize: s(typography.size["2xl"]), fontWeight: typography.weight.bold, color: colors.text.primary }}>{formatNumber(stats.totalTokens)}</span>
        </div>
      </div>

      {/* Activity Heatmap - Full Width */}
      <div style={{ marginTop: s(spacing[14]), display: "flex", flexDirection: "column", backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[8]) }}>
        <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.tertiary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase", marginBottom: s(spacing[4]) }}>Activity</span>
        <ActivityHeatmap dailyActivity={stats.dailyActivity} year={stats.year} maxStreakDays={stats.maxStreakDays} theme={colors} layoutFormat="story" />
      </div>

      {/* Two Column: Top Tools | By The Numbers */}
      <div style={{ marginTop: s(spacing[12]), display: "flex", flexDirection: "row", gap: s(spacing[6]) }}>
        {/* Top Tools Card */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[8]) }}>
          <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.tertiary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase", marginBottom: s(spacing[6]) }}>Top Tools</span>
          <div style={{ display: "flex", flexDirection: "column", gap: s(spacing[5]) }}>
            {stats.topTools.slice(0, 4).map((tool, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: s(spacing[4]) }}>
                <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.bold, color: colors.text.tertiary, width: s(32), textAlign: "right" }}>{i + 1}</span>
                <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.primary }}>{truncate(tool.name, 14)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By The Numbers Card */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[8]) }}>
          <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.tertiary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase", marginBottom: s(spacing[6]) }}>By The Numbers</span>
          <div style={{ display: "flex", flexDirection: "column", gap: s(spacing[5]) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Avg Msgs/Thread</span>
              <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{avgMessagesPerThread}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Token Split</span>
              <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{inputPct}% / {outputPct}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Top Client</span>
              <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{topClient}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Peak Period</span>
              <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{hourlyStats.peakPeriod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coding Hours - Full Width Expanded Card */}
      <div style={{ marginTop: s(spacing[12]), display: "flex", flexDirection: "column", backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[10]) }}>
        <span style={{ fontSize: s(typography.size.lg), fontWeight: typography.weight.medium, color: colors.text.tertiary, letterSpacing: typography.letterSpacing.wider, textTransform: "uppercase", marginBottom: s(spacing[6]) }}>Coding Hours</span>
        <div style={{ display: "flex", flexDirection: "row", gap: s(spacing[12]), marginBottom: s(spacing[8]) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: s(spacing[2]) }}>
            <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Peak Hour</span>
            <span style={{ fontSize: s(typography.size["2xl"]), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{hourlyStats.peakHour}:00 - {(hourlyStats.peakHour + 1) % 24}:00</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: s(spacing[2]) }}>
            <span style={{ fontSize: s(typography.size.base), color: colors.text.tertiary }}>Peak Period</span>
            <span style={{ fontSize: s(typography.size["2xl"]), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{hourlyStats.peakPeriod}</span>
          </div>
        </div>
        <StoryCodingHoursChart hourlyStats={hourlyStats} hourlyActivity={stats.hourlyActivity} colors={colors} scale={scale} expanded={true} />
      </div>

      {/* Bottom Stats Row: Projects | Credits */}
      <div style={{ marginTop: s(spacing[12]), display: "flex", flexDirection: "row", gap: s(spacing[6]) }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[8]), alignItems: "center", gap: s(spacing[3]) }}>
          <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>Projects</span>
          <span style={{ fontSize: s(typography.size["3xl"]), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{formatNumber(stats.totalProjects)}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, backgroundColor: colors.surface, borderRadius: s(layout.radius.xl), padding: s(spacing[8]), alignItems: "center", gap: s(spacing[3]) }}>
          <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.medium, color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: typography.letterSpacing.wide }}>Credits</span>
          <span style={{ fontSize: s(typography.size["3xl"]), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{formatCredits(stats.totalCredits)}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: s(spacing[14]), display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.medium, color: colors.text.muted }}>ampcode.com</span>
      </div>
    </div>
  );
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
}
