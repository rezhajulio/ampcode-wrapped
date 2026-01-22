import type { ClipboardProvider, ClipboardResult } from "./types";
import { DEFAULT_TIMEOUT_MS } from "./types";

async function commandExists(cmd: string): Promise<boolean> {
  try {
    const proc = Bun.spawn(["which", cmd], { stdout: "pipe", stderr: "pipe" });
    return (await proc.exited) === 0;
  } catch {
    return false;
  }
}

export const linuxProvider: ClipboardProvider = {
  name: "Linux (wl-copy/xclip)",

  async isAvailable(): Promise<boolean> {
    if (process.platform !== "linux") return false;
    return (await commandExists("wl-copy")) || (await commandExists("xclip"));
  },

  async copyImage(imagePath: string): Promise<ClipboardResult> {
    const isWayland = await commandExists("wl-copy");
    const cmd = isWayland
      ? ["wl-copy", "--type", "image/png"]
      : ["xclip", "-selection", "clipboard", "-t", "image/png", "-i", imagePath];

    const proc = Bun.spawn(cmd, {
      stdin: isWayland ? Bun.file(imagePath) : undefined,
      stdout: "pipe",
      stderr: "pipe",
    });

    const timeoutId = setTimeout(() => proc.kill(), DEFAULT_TIMEOUT_MS);

    try {
      const exitCode = await proc.exited;
      clearTimeout(timeoutId);

      if (exitCode === 0) return { success: true };
      const stderr = await new Response(proc.stderr).text();
      return { success: false, error: stderr.trim() || `Command exited with code ${exitCode}` };
    } catch (error) {
      clearTimeout(timeoutId);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  },
};
