import type { AmpStats, Thread, RankedItem, WeekdayActivity, PeakHourPersona } from "./types";
import { collectThreads } from "./collector";

export async function calculateStats(year: number, customDataDir?: string): Promise<AmpStats> {
  const allThreads = await collectThreads(undefined, customDataDir);
  const threads = allThreads.filter((t) => new Date(t.created).getFullYear() === year);

  // Find first thread date across all years
  let firstThreadDate: Date;
  let daysSinceFirstThread: number;

  if (allThreads.length === 0) {
    firstThreadDate = new Date();
    daysSinceFirstThread = 0;
  } else {
    const firstTimestamp = Math.min(...allThreads.map((t) => t.created));
    firstThreadDate = new Date(firstTimestamp);
    daysSinceFirstThread = Math.floor((Date.now() - firstTimestamp) / (1000 * 60 * 60 * 24));
  }

  let totalMessages = 0;
  let totalUserMessages = 0;
  let totalAssistantMessages = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCredits = 0;

  const toolCounts = new Map<string, number>();
  const projectCounts = new Map<string, number>();
  const clientCounts = new Map<string, number>();
  const dailyActivity = new Map<string, number>();
  const weekdayCounts: [number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0];
  const hourlyActivity: number[] = new Array(24).fill(0);

  let longestThread: { threadId: string; messageCount: number } | null = null;

  for (const thread of threads) {
    const created = new Date(thread.created);
    const dateKey = formatDateKey(created);

    dailyActivity.set(dateKey, (dailyActivity.get(dateKey) || 0) + 1);

    weekdayCounts[created.getDay()]++;

    hourlyActivity[created.getHours()]++;

    if (thread.env?.initial?.trees) {
      for (const tree of thread.env.initial.trees) {
        if (tree.displayName) {
          projectCounts.set(tree.displayName, (projectCounts.get(tree.displayName) || 0) + 1);
        }
      }
    }

    if (thread.env?.initial?.platform?.clientType) {
      const clientType = thread.env.initial.platform.clientType;
      clientCounts.set(clientType, (clientCounts.get(clientType) || 0) + 1);
    }

    const threadMessageCount = thread.messages.length;
    if (!longestThread || threadMessageCount > longestThread.messageCount) {
      longestThread = { threadId: thread.id, messageCount: threadMessageCount };
    }

    for (const msg of thread.messages) {
      totalMessages++;

      if (msg.role === "user") {
        totalUserMessages++;
      } else if (msg.role === "assistant") {
        totalAssistantMessages++;

        if (msg.usage) {
          totalInputTokens += msg.usage.inputTokens + (msg.usage.cacheCreationInputTokens ?? 0) + (msg.usage.cacheReadInputTokens ?? 0);
          totalOutputTokens += msg.usage.outputTokens;
          totalCredits += msg.usage.credits ?? 0;
        }

        for (const content of msg.content) {
          if (content.type === "tool_use" && content.name) {
            toolCounts.set(content.name, (toolCounts.get(content.name) || 0) + 1);
          }
        }
      }
    }
  }

  const topTools = rankMap(toolCounts, 6);
  const topProjects = rankMap(projectCounts, 6);

  const { maxStreak, currentStreak, maxStreakDays } = calculateStreaks(dailyActivity, year);
  const mostActiveDay = findMostActiveDay(dailyActivity);
  const weekdayActivity = buildWeekdayActivity(weekdayCounts);

  const daysActive = dailyActivity.size;
  const totalTokens = totalInputTokens + totalOutputTokens;
  const avgTokensPerDay = daysActive > 0 ? Math.round(totalTokens / daysActive) : 0;
  const avgMessagesPerThread = threads.length > 0 ? Math.round(totalMessages / threads.length) : 0;
  const peakHourPersona = getPeakHourPersona(hourlyActivity);

  return {
    year,
    firstThreadDate,
    daysSinceFirstThread,
    totalThreads: threads.length,
    totalMessages,
    totalUserMessages,
    totalAssistantMessages,
    totalProjects: projectCounts.size,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalCredits,
    topTools,
    topProjects,
    maxStreak,
    currentStreak,
    maxStreakDays,
    dailyActivity,
    mostActiveDay,
    weekdayActivity,
    hourlyActivity,
    clientUsage: clientCounts,
    daysActive,
    avgTokensPerDay,
    avgMessagesPerThread,
    longestThread,
    peakHourPersona,
  };
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function rankMap(m: Map<string, number>, limit: number): RankedItem[] {
  return Array.from(m.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function calculateStreaks(
  dailyActivity: Map<string, number>,
  year: number
): { maxStreak: number; currentStreak: number; maxStreakDays: Set<string> } {
  const activeDates = Array.from(dailyActivity.keys())
    .filter((date) => date.startsWith(String(year)))
    .sort();

  if (activeDates.length === 0) {
    return { maxStreak: 0, currentStreak: 0, maxStreakDays: new Set() };
  }

  let maxStreak = 1;
  let tempStreak = 1;
  let tempStreakStart = 0;
  let maxStreakStart = 0;
  let maxStreakEnd = 0;

  for (let i = 1; i < activeDates.length; i++) {
    const prevDate = new Date(activeDates[i - 1]);
    const currDate = new Date(activeDates[i]);

    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
        maxStreakStart = tempStreakStart;
        maxStreakEnd = i;
      }
    } else {
      tempStreak = 1;
      tempStreakStart = i;
    }
  }

  const maxStreakDays = new Set<string>();
  for (let i = maxStreakStart; i <= maxStreakEnd; i++) {
    maxStreakDays.add(activeDates[i]);
  }

  const today = formatDateKey(new Date());
  const yesterday = formatDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

  let currentStreak = 0;
  if (dailyActivity.has(today)) {
    currentStreak = countStreakBackwards(dailyActivity, new Date());
  } else if (dailyActivity.has(yesterday)) {
    currentStreak = countStreakBackwards(dailyActivity, new Date(Date.now() - 24 * 60 * 60 * 1000));
  }

  return { maxStreak, currentStreak, maxStreakDays };
}

function countStreakBackwards(dailyActivity: Map<string, number>, startDate: Date): number {
  let streak = 1;
  let checkDate = new Date(startDate);

  while (true) {
    checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    if (dailyActivity.has(formatDateKey(checkDate))) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function findMostActiveDay(dailyActivity: Map<string, number>): { date: string; count: number; formattedDate: string } | null {
  if (dailyActivity.size === 0) return null;

  let maxDate = "";
  let maxCount = 0;

  for (const [date, count] of dailyActivity.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxDate = date;
    }
  }

  if (!maxDate) return null;

  const [year, month, day] = maxDate.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedDate = `${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;

  return { date: maxDate, count: maxCount, formattedDate };
}

function buildWeekdayActivity(counts: [number, number, number, number, number, number, number]): WeekdayActivity {
  const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let mostActiveDay = 0;
  let maxCount = 0;
  for (let i = 0; i < 7; i++) {
    if (counts[i] > maxCount) {
      maxCount = counts[i];
      mostActiveDay = i;
    }
  }

  return {
    counts,
    mostActiveDay,
    mostActiveDayName: WEEKDAY_NAMES[mostActiveDay],
    maxCount,
  };
}

function getPeakHourPersona(hourlyActivity: number[]): PeakHourPersona {
  let peakHour = 0;
  let maxCount = 0;
  for (let i = 0; i < 24; i++) {
    if (hourlyActivity[i] > maxCount) {
      maxCount = hourlyActivity[i];
      peakHour = i;
    }
  }

  let period: string;
  let emoji: string;
  let persona: string;

  if (peakHour >= 5 && peakHour < 9) {
    period = "Early Morning";
    emoji = "🌅";
    persona = "Early Bird";
  } else if (peakHour >= 9 && peakHour < 17) {
    period = "Daytime";
    emoji = "🌤️";
    persona = "Day Worker";
  } else if (peakHour >= 17 && peakHour < 21) {
    period = "Evening";
    emoji = "🦉";
    persona = "Night Owl";
  } else {
    period = "Late Night";
    emoji = "🌙";
    persona = "Midnight Coder";
  }

  return { hour: peakHour, period, emoji, persona };
}

export function getHourlyStats(hourlyActivity: number[]): { peakHour: number; peakPeriod: string; peakPeriodEmoji: string } {
  let peakHour = 0;
  let maxCount = 0;
  for (let i = 0; i < 24; i++) {
    if (hourlyActivity[i] > maxCount) {
      maxCount = hourlyActivity[i];
      peakHour = i;
    }
  }

  let morning = 0, afternoon = 0, evening = 0, night = 0;
  for (let i = 0; i < 24; i++) {
    if (i >= 6 && i < 12) morning += hourlyActivity[i];
    else if (i >= 12 && i < 18) afternoon += hourlyActivity[i];
    else if (i >= 18 && i < 24) evening += hourlyActivity[i];
    else night += hourlyActivity[i];
  }

  const periods = [
    { name: "Morning", count: morning, emoji: "🌅" },
    { name: "Afternoon", count: afternoon, emoji: "☀️" },
    { name: "Evening", count: evening, emoji: "🌆" },
    { name: "Night", count: night, emoji: "🌙" },
  ];

  const peak = periods.reduce((max, p) => (p.count > max.count ? p : max), periods[0]);

  return { peakHour, peakPeriod: peak.name, peakPeriodEmoji: peak.emoji };
}
