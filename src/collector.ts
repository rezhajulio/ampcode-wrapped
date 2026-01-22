import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { Thread } from "./types";

function getAmpDataPath(): string {
  const home = homedir();
  const xdgData = process.env.XDG_DATA_HOME || join(home, ".local", "share");
  return join(xdgData, "amp", "threads");
}

export async function checkAmpDataExists(): Promise<boolean> {
  try {
    await readdir(getAmpDataPath());
    return true;
  } catch {
    return false;
  }
}

export async function collectThreads(year?: number, customDataDir?: string): Promise<Thread[]> {
  const threadsPath = customDataDir || getAmpDataPath();

  try {
    const files = await readdir(threadsPath);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const results = await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = join(threadsPath, file);
          const thread = (await Bun.file(filePath).json()) as Thread;

          // Filter by year if specified
          if (year) {
            const created = new Date(thread.created);
            if (created.getFullYear() !== year) {
              return null;
            }
          }

          return thread;
        } catch {
          return null;
        }
      })
    );

    return results.filter((t): t is Thread => t !== null);
  } catch (error) {
    throw new Error(`Failed to read threads: ${error}`);
  }
}

export function getAmpDataDir(): string {
  return getAmpDataPath();
}

export async function getAvailableYears(customDataDir?: string): Promise<number[]> {
  const threadsPath = customDataDir || getAmpDataPath();

  try {
    const files = await readdir(threadsPath);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const years = new Set<number>();
    await Promise.all(
      jsonFiles.map(async (file) => {
        try {
          const filePath = join(threadsPath, file);
          const thread = (await Bun.file(filePath).json()) as Thread;
          const created = new Date(thread.created);
          if (!isNaN(created.getTime())) {
            years.add(created.getFullYear());
          }
        } catch {
        }
      })
    );

    return Array.from(years).sort((a, b) => b - a);
  } catch {
    return [];
  }
}
