export interface Thread {
  v: number;
  id: string;
  created: number;
  messages: Message[];
  env?: ThreadEnv;
}

export interface ThreadEnv {
  initial?: {
    trees?: Tree[];
    platform?: Platform;
  };
}

export interface Tree {
  displayName: string;
  uri: string;
}

export interface Platform {
  os: string;
  client: string;
  clientVersion: string;
  clientType: string;
}

export interface Message {
  role: "user" | "assistant";
  messageId: number;
  content: Content[];
  usage?: Usage;
  meta?: MessageMeta;
}

export interface MessageMeta {
  sentAt?: number;
}

export interface Content {
  type: string;
  text?: string;
  name?: string;
  toolUseID?: string;
  id?: string;
}

export interface Usage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  credits: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
}

export interface AmpStats {
  year: number;
  firstThreadDate: Date;
  daysSinceFirstThread: number;
  totalThreads: number;
  totalMessages: number;
  totalUserMessages: number;
  totalAssistantMessages: number;
  totalProjects: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCredits: number;
  topTools: RankedItem[];
  topProjects: RankedItem[];
  maxStreak: number;
  currentStreak: number;
  maxStreakDays: Set<string>;
  dailyActivity: Map<string, number>;
  mostActiveDay: {
    date: string;
    count: number;
    formattedDate: string;
  } | null;
  weekdayActivity: WeekdayActivity;
  hourlyActivity: number[];
  clientUsage: Map<string, number>;
  daysActive: number;
  avgTokensPerDay: number;
  avgMessagesPerThread: number;
  longestThread: { threadId: string; messageCount: number } | null;
  peakHourPersona: PeakHourPersona;
}

export interface RankedItem {
  name: string;
  count: number;
}

export interface WeekdayActivity {
  counts: [number, number, number, number, number, number, number];
  mostActiveDay: number;
  mostActiveDayName: string;
  maxCount: number;
}

export interface HourlyStats {
  peakHour: number;
  peakPeriod: string;
  peakPeriodEmoji: string;
}

export interface PeakHourPersona {
  hour: number;
  period: string;
  emoji: string;
  persona: string;
}
