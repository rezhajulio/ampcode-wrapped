import type { AmpStats } from "../../types";
import { formatNumber } from "../../utils/format";
import { typography, spacing, components, type ThemeColors } from "../design-tokens";
import { createScaler, flexColumn, flexRow } from "../styles";

interface SectionTitleProps {
  children: React.ReactNode;
  colors: ThemeColors;
  scale?: number;
}

export function SectionTitle({ children, colors, scale = 1 }: SectionTitleProps) {
  const s = createScaler(scale);
  return (
    <span style={{ fontSize: s(components.sectionHeader.fontSize), fontWeight: components.sectionHeader.fontWeight, color: colors.text.tertiary, letterSpacing: components.sectionHeader.letterSpacing, textTransform: components.sectionHeader.textTransform }}>
      {children}
    </span>
  );
}

interface SectionProps {
  title: string;
  marginTop?: number;
  children: React.ReactNode;
  colors: ThemeColors;
  scale?: number;
}

export function Section({ title, marginTop = 0, children, colors, scale = 1 }: SectionProps) {
  const s = createScaler(scale);
  return (
    <div style={{ ...flexColumn(s(spacing[4])), marginTop }}>
      <SectionTitle colors={colors} scale={scale}>{title}</SectionTitle>
      {children}
    </div>
  );
}

interface RankingListProps {
  title: string;
  items: { name: string }[];
  colors: ThemeColors;
  scale?: number;
  maxItems?: number;
}

export function RankingList({ title, items, colors, scale = 1, maxItems = 6 }: RankingListProps) {
  const s = createScaler(scale);
  return (
    <div style={{ ...flexColumn(s(spacing[5])), flex: 1, paddingBottom: s(spacing[4]) }}>
      <SectionTitle colors={colors} scale={scale}>{title}</SectionTitle>
      <div style={flexColumn(s(spacing[5]))}>
        {items.slice(0, maxItems).map((item, i) => (
          <div key={i} style={{ ...flexRow(s(spacing[4])), alignItems: "center" }}>
            <span style={{ fontSize: s(components.ranking.numberSize), fontWeight: typography.weight.bold, color: colors.text.tertiary, width: s(components.ranking.numberWidth), textAlign: "right" }}>{i + 1}</span>
            <span style={{ fontSize: s(components.ranking.itemSize), fontWeight: typography.weight.medium, color: colors.text.primary }}>{truncate(item.name, 22)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BreakdownRowProps {
  label: string;
  leftLabel: string;
  leftPct: number;
  rightLabel: string;
  rightPct: number;
  leftValue: string;
  rightValue: string;
  colors: ThemeColors;
  scale?: number;
}

export function BreakdownRow({ label, leftLabel, leftPct, rightLabel, rightPct, leftValue, rightValue, colors, scale = 1 }: BreakdownRowProps) {
  const s = createScaler(scale);
  return (
    <div style={flexColumn(s(spacing[2]))}>
      <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.medium, color: colors.text.tertiary }}>{label}</span>
      <div style={{ ...flexRow(2), height: s(12), borderRadius: s(4), overflow: "hidden" }}>
        <div style={{ flex: leftPct, backgroundColor: colors.accent.primary, borderRadius: leftPct === 100 ? s(4) : `${s(4)}px 0 0 ${s(4)}px` }} />
        <div style={{ flex: rightPct, backgroundColor: colors.heatmap.level2, borderRadius: rightPct === 100 ? s(4) : `0 ${s(4)}px ${s(4)}px 0` }} />
      </div>
      <div style={{ ...flexRow(), justifyContent: "space-between" }}>
        <span style={{ fontSize: s(typography.size.sm), color: colors.accent.primary }}>{leftLabel}: {leftValue} ({leftPct}%)</span>
        <span style={{ fontSize: s(typography.size.sm), color: colors.text.muted }}>{rightLabel}: {rightValue} ({rightPct}%)</span>
      </div>
    </div>
  );
}

interface ByTheNumbersProps {
  stats: AmpStats;
  colors: ThemeColors;
  scale?: number;
}

export function ByTheNumbers({ stats, colors, scale = 1 }: ByTheNumbersProps) {
  const s = createScaler(scale);
  const totalTokens = stats.totalInputTokens + stats.totalOutputTokens;
  const inputPct = totalTokens > 0 ? Math.round((stats.totalInputTokens / totalTokens) * 100) : 0;
  const outputPct = 100 - inputPct;

  const avgMessagesPerThread = stats.totalThreads > 0 ? Math.round(stats.totalMessages / stats.totalThreads) : 0;
  const avgTokensPerThread = stats.totalThreads > 0 ? Math.round(stats.totalTokens / stats.totalThreads) : 0;

  return (
    <div style={{ ...flexColumn(s(spacing[5])), flex: 1, paddingBottom: s(spacing[4]) }}>
      <SectionTitle colors={colors} scale={scale}>By The Numbers</SectionTitle>
      <div style={flexColumn(s(spacing[6]))}>
        <BreakdownRow label="Tokens" leftLabel="Input" leftPct={inputPct} rightLabel="Output" rightPct={outputPct} leftValue={formatNumber(stats.totalInputTokens)} rightValue={formatNumber(stats.totalOutputTokens)} colors={colors} scale={scale} />
        <div style={flexColumn(s(spacing[2]))}>
          <span style={{ fontSize: s(typography.size.base), fontWeight: typography.weight.medium, color: colors.text.tertiary }}>Avg per Thread</span>
          <div style={flexRow(s(spacing[6]))}>
            <div style={flexColumn()}>
              <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{formatNumber(avgMessagesPerThread)}</span>
              <span style={{ fontSize: s(typography.size.sm), color: colors.text.muted }}>messages</span>
            </div>
            <div style={flexColumn()}>
              <span style={{ fontSize: s(typography.size.xl), fontWeight: typography.weight.bold, color: colors.accent.primary }}>{formatNumber(avgTokensPerThread)}</span>
              <span style={{ fontSize: s(typography.size.sm), color: colors.text.muted }}>tokens</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + "...";
}
