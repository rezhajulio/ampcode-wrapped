export interface ClipboardResult {
  success: boolean;
  error?: string;
}

export interface ClipboardProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  copyImage(imagePath: string): Promise<ClipboardResult>;
}

export const DEFAULT_TIMEOUT_MS = 5000;
