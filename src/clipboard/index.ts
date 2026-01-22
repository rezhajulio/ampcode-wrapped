import { tmpdir } from "os";
import { join } from "path";
import { unlink } from "fs/promises";
import type { ClipboardResult, ClipboardProvider } from "./types";
import { macOSProvider } from "./macos";
import { linuxProvider } from "./linux";

export type { ClipboardResult };

const providers: ClipboardProvider[] = [macOSProvider, linuxProvider];

async function getProvider(): Promise<ClipboardProvider | null> {
  for (const provider of providers) {
    if (await provider.isAvailable()) return provider;
  }
  return null;
}

export async function copyImageToClipboard(pngBuffer: Buffer, filename: string): Promise<ClipboardResult> {
  const provider = await getProvider();

  if (!provider) {
    return { success: false, error: getUnsupportedPlatformError() };
  }

  const tempPath = join(tmpdir(), filename);

  try {
    await Bun.write(tempPath, pngBuffer);
    return await provider.copyImage(tempPath);
  } finally {
    try {
      await unlink(tempPath);
    } catch {}
  }
}

function getUnsupportedPlatformError(): string {
  if (process.platform === "linux") {
    return "No clipboard tool found. Install wl-clipboard (Wayland) or xclip (X11).";
  }
  return `Clipboard not supported on platform: ${process.platform}`;
}
