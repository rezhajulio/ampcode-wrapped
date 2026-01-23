export type TerminalType = "ghostty" | "kitty" | "iterm" | "wezterm" | "konsole" | "vscode" | "warp" | "standard";

export interface TerminalInfo {
  type: TerminalType;
  supportsKittyProtocol: boolean;
  supportsITerm2Protocol: boolean;
}

export function detectTerminal(): TerminalInfo {
  const env = process.env;
  let type: TerminalType = "standard";
  let supportsKittyProtocol = false;
  let supportsITerm2Protocol = false;

  if (env.TERM === "xterm-ghostty") {
    type = "ghostty";
    supportsKittyProtocol = true;
  } else if (env.TERM === "xterm-kitty" || env.KITTY_WINDOW_ID) {
    type = "kitty";
    supportsKittyProtocol = true;
  } else if (env.TERM_PROGRAM === "WezTerm") {
    type = "wezterm";
    supportsKittyProtocol = true;
    supportsITerm2Protocol = true;
  } else if (env.TERM_PROGRAM === "iTerm.app") {
    type = "iterm";
    supportsITerm2Protocol = true;
  } else if (env.TERM_PROGRAM === "konsole" || env.KONSOLE_VERSION) {
    type = "konsole";
    supportsKittyProtocol = true;
  } else if (env.TERM_PROGRAM === "vscode") {
    type = "vscode";
    supportsITerm2Protocol = true;
  } else if (env.TERM_PROGRAM === "WarpTerminal") {
    type = "warp";
    supportsKittyProtocol = true;
  }

  return { type, supportsKittyProtocol, supportsITerm2Protocol };
}

function displayKittyProtocol(pngBuffer: Buffer): void {
  const base64Data = pngBuffer.toString("base64");
  const chunkSize = 4096;

  for (let i = 0; i < base64Data.length; i += chunkSize) {
    const chunk = base64Data.slice(i, i + chunkSize);
    const isLast = i + chunkSize >= base64Data.length;

    if (i === 0) {
      process.stdout.write(`\x1b_Ga=T,f=100,t=d,m=${isLast ? 0 : 1};${chunk}\x1b\\`);
    } else {
      process.stdout.write(`\x1b_Gm=${isLast ? 0 : 1};${chunk}\x1b\\`);
    }
  }
  process.stdout.write("\n");
}

function displayITerm2Protocol(pngBuffer: Buffer): void {
  const base64Data = pngBuffer.toString("base64");
  const filename = Buffer.from("ampcode-wrapped.png").toString("base64");
  process.stdout.write(`\x1b]1337;File=name=${filename};size=${pngBuffer.length};inline=1:${base64Data}\x07\n`);
}

export async function displayInTerminal(pngBuffer: Buffer): Promise<boolean> {
  const terminal = detectTerminal();

  try {
    if (terminal.supportsKittyProtocol) {
      displayKittyProtocol(pngBuffer);
      return true;
    }

    if (terminal.supportsITerm2Protocol) {
      displayITerm2Protocol(pngBuffer);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function getTerminalName(): string {
  return detectTerminal().type;
}
