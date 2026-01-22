#!/usr/bin/env bun

import * as p from "@clack/prompts";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { homedir } from "node:os";

import { checkAmpDataExists, getAmpDataDir, getAvailableYears } from "./collector";
import { calculateStats } from "./stats";
import { generateImage, type GeneratedImage, type GeneratedSvg, type ImageFormat } from "./image/generator";
import type { ThemeName, LayoutFormat } from "./image/design-tokens";
import { displayInTerminal, getTerminalName } from "./terminal/display";
import { copyImageToClipboard } from "./clipboard";
import { formatNumber } from "./utils/format";
import type { AmpStats } from "./types";

const VERSION = "1.0.0";

function serializeStats(stats: AmpStats): Record<string, unknown> {
  return {
    ...stats,
    firstThreadDate: stats.firstThreadDate.toISOString(),
    dailyActivity: Object.fromEntries(stats.dailyActivity),
    clientUsage: Object.fromEntries(stats.clientUsage),
    maxStreakDays: Array.from(stats.maxStreakDays),
  };
}

function printHelp() {
  console.log(`
ampcode-wrapped v${VERSION}

Generate your Amp year in review stats card.

USAGE:
  ampcode-wrapped [OPTIONS]

OPTIONS:
  --year <YYYY>      Generate wrapped for a specific year (default: current year)
  --data-dir <DIR>   Override data directory (default: ~/.local/share/amp/threads)
  --output, -o <PATH> Save image directly to specified path (skips save prompt)
  --format <default>   Image layout format (default: default)
                       default: 1500x1700 - standard layout
  --theme <dark|light> Color theme (default: dark)
  --svg              Export as SVG instead of PNG
  --json             Output stats as JSON to stdout and exit (no image generation)
  --yes, -y          Skip confirmation prompts (auto-save, skip share prompt)
  --quiet, -q        Suppress rich prompts (no intro/outro/spinners)
  --no-clipboard     Skip copying image to clipboard
  --no-terminal-image Skip displaying image in terminal
  --help, -h         Show this help message
  --version, -v      Show version number

ENVIRONMENT:
  CI=true            Auto-disables clipboard and terminal image display

EXAMPLES:
  ampcode-wrapped                    # Generate current year wrapped
  ampcode-wrapped --year 2025        # Generate 2025 wrapped
`);
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      year: { type: "string" },
      "data-dir": { type: "string" },
      output: { type: "string", short: "o" },
      format: { type: "string" },
      theme: { type: "string" },
      svg: { type: "boolean" },
      json: { type: "boolean" },
      yes: { type: "boolean", short: "y" },
      quiet: { type: "boolean", short: "q" },
      "no-clipboard": { type: "boolean" },
      "no-terminal-image": { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    strict: true,
    allowPositionals: false,
  });

  const isCI = process.env.CI === "true";
  const autoConfirm = values.yes ?? false;
  const quietMode = values.quiet ?? false;
  const outputPath = values.output;
  const svgFormat = values.svg ?? false;
  const jsonOutput = values.json ?? false;
  const noClipboard = values["no-clipboard"] ?? isCI;
  const noTerminalImage = values["no-terminal-image"] ?? isCI;
  const imageFormat: ImageFormat = svgFormat ? "svg" : "png";
  const theme: ThemeName = values.theme === "light" ? "light" : "dark";
  
  let layoutFormat: LayoutFormat = "default";
  if (values.format && values.format !== "default") {
    const errorMsg = `Invalid format "${values.format}". Valid option: default`;
    if (quietMode) {
      console.error(errorMsg);
    } else {
      p.cancel(errorMsg);
    }
    process.exit(1);
  }

  if (values.help) {
    printHelp();
    process.exit(0);
  }

  if (values.version) {
    console.log(`ampcode-wrapped v${VERSION}`);
    process.exit(0);
  }

  if (!quietMode) {
    p.intro("ampcode wrapped");
  }

  const currentYear = new Date().getFullYear();
  const customDataDir = values["data-dir"];

  let requestedYear: number | undefined;
  if (values.year) {
    const parsed = parseInt(values.year, 10);
    const minYear = 2020;
    const maxYear = currentYear + 1;

    if (isNaN(parsed) || !/^\d{4}$/.test(values.year)) {
      const errorMsg = `Invalid year "${values.year}". Please provide a valid 4-digit year (e.g., --year 2025).`;
      if (quietMode) {
        console.error(errorMsg);
      } else {
        p.cancel(errorMsg);
      }
      process.exit(1);
    }

    if (parsed < minYear || parsed > maxYear) {
      const errorMsg = `Year ${parsed} is out of range. Please provide a year between ${minYear} and ${maxYear}.`;
      if (quietMode) {
        console.error(errorMsg);
      } else {
        p.cancel(errorMsg);
      }
      process.exit(1);
    }

    requestedYear = parsed;
  } else {
    requestedYear = currentYear;
  }

  const dataExists = await checkAmpDataExists();
  if (!dataExists && !customDataDir) {
    if (quietMode) {
      console.error(`Amp data not found in ${getAmpDataDir()}`);
    } else {
      p.cancel(`Amp data not found in ${getAmpDataDir()}\n\nMake sure you have used Amp at least once.`);
    }
    process.exit(0);
  }

  const spinner = quietMode ? null : p.spinner();
  if (spinner) {
    spinner.start("Scanning your Amp history...");
  } else {
    console.log("Scanning your Amp history...");
  }

  let stats: AmpStats;
  try {
    stats = await calculateStats(requestedYear, customDataDir);
  } catch (error) {
    if (spinner) {
      spinner.stop("Failed to collect stats");
      p.cancel(`Error: ${error}`);
    } else {
      console.error(`Error: ${error}`);
    }
    process.exit(1);
  }

  if (stats.totalThreads === 0) {
    if (spinner) {
      spinner.stop("No data found");
    }

    let errorMsg = `No Amp activity found for ${requestedYear}.`;
    
    if (values.year) {
      const availableYears = await getAvailableYears(customDataDir);
      if (availableYears.length > 0) {
        const yearsStr = availableYears.slice(0, 3).join(", ");
        errorMsg += `\n\nActivity found for: ${yearsStr}${availableYears.length > 3 ? "..." : ""}`;
        errorMsg += `\nTry omitting --year to see all activity, or use --year ${availableYears[0]}.`;
      }
    }

    if (quietMode) {
      console.error(errorMsg);
    } else {
      p.cancel(errorMsg);
    }
    process.exit(0);
  }

  if (spinner) {
    spinner.stop("Found your stats!");
  }

  if (jsonOutput) {
    console.log(JSON.stringify(serializeStats(stats), null, 2));
    process.exit(0);
  }

  const summaryLines = [
    `Threads:       ${formatNumber(stats.totalThreads)}`,
    `Messages:      ${formatNumber(stats.totalMessages)}`,
    `Total Tokens:  ${formatNumber(stats.totalTokens)}`,
    `Projects:      ${formatNumber(stats.totalProjects)}`,
    `Streak:        ${stats.maxStreak} days`,
    stats.totalCredits > 0 && `Credits:       $${stats.totalCredits.toFixed(2)}`,
    stats.mostActiveDay && `Most Active:   ${stats.mostActiveDay.formattedDate}`,
  ].filter(Boolean);

  if (!quietMode) {
    p.note(summaryLines.join("\n"), `Your ${requestedYear} in Amp`);
  } else {
    console.log(`\nYour ${requestedYear} in Amp:`);
    summaryLines.forEach((line) => console.log(`  ${line}`));
  }

  if (spinner) {
    spinner.start("Generating your wrapped image...");
  } else {
    console.log("Generating your wrapped image...");
  }

  let result: GeneratedImage | GeneratedSvg;
  try {
    result = await generateImage(stats, { format: imageFormat, theme, layoutFormat });
  } catch (error) {
    if (spinner) {
      spinner.stop("Failed to generate image");
      p.cancel(`Error generating image: ${error}`);
    } else {
      console.error(`Error generating image: ${error}`);
    }
    process.exit(1);
  }

  if (spinner) {
    spinner.stop("Image generated!");
  } else {
    console.log("Image generated!");
  }

  const fileExtension = imageFormat === "svg" ? "svg" : "png";
  const formatSuffix = layoutFormat !== "default" ? `-${layoutFormat}` : "";
  const filename = `ampcode-wrapped-${requestedYear}${formatSuffix}.${fileExtension}`;

  if ("svg" in result) {
    const savePath = outputPath ?? join(homedir(), filename);

    let shouldSave: boolean;
    if (outputPath) {
      shouldSave = true;
    } else if (autoConfirm) {
      shouldSave = true;
    } else {
      const saveResult = await p.confirm({
        message: `Save SVG to ~/${filename}?`,
        initialValue: true,
      });
      if (p.isCancel(saveResult)) {
        if (!quietMode) {
          p.outro("Cancelled");
        }
        process.exit(0);
      }
      shouldSave = saveResult;
    }

    if (shouldSave) {
      try {
        await Bun.write(savePath, result.svg);
        if (!quietMode) {
          p.log.success(`Saved to ${savePath}`);
        } else {
          console.log(`Saved to ${savePath}`);
        }
      } catch (error) {
        if (!quietMode) {
          p.log.error(`Failed to save: ${error}`);
        } else {
          console.error(`Failed to save: ${error}`);
        }
      }
    }
  } else {
    const image = result;

    if (!noTerminalImage) {
      const displayed = await displayInTerminal(image.displaySize);
      if (!displayed && !quietMode) {
        p.log.info(`Terminal (${getTerminalName()}) doesn't support inline images`);
      }
    }

    if (!noClipboard) {
      const { success, error } = await copyImageToClipboard(image.fullSize, filename);

      if (success) {
        if (!quietMode) {
          p.log.success("Automatically copied image to clipboard!");
        } else {
          console.log("Copied image to clipboard");
        }
      } else if (!quietMode) {
        p.log.warn(`Clipboard unavailable: ${error}`);
        p.log.info("You can save the image to disk instead.");
      }
    }

    const savePath = outputPath ?? join(homedir(), filename);

    let shouldSave: boolean;
    if (outputPath) {
      shouldSave = true;
    } else if (autoConfirm) {
      shouldSave = true;
    } else {
      const saveResult = await p.confirm({
        message: `Save image to ~/${filename}?`,
        initialValue: true,
      });
      if (p.isCancel(saveResult)) {
        if (!quietMode) {
          p.outro("Cancelled");
        }
        process.exit(0);
      }
      shouldSave = saveResult;
    }

    if (shouldSave) {
      try {
        await Bun.write(savePath, image.fullSize);
        if (!quietMode) {
          p.log.success(`Saved to ${savePath}`);
        } else {
          console.log(`Saved to ${savePath}`);
        }
      } catch (error) {
        if (!quietMode) {
          p.log.error(`Failed to save: ${error}`);
        } else {
          console.error(`Failed to save: ${error}`);
        }
      }
    }
  }

  if (!autoConfirm) {
    const shouldShare = await p.confirm({
      message: "Share on X (Twitter)? Don't forget to attach your image!",
      initialValue: true,
    });

    if (!p.isCancel(shouldShare) && shouldShare) {
      const tweetUrl = generateTweetUrl(stats);
      const opened = await openUrl(tweetUrl);
      if (opened) {
        p.log.success("Opened X in your browser.");
      } else {
        p.log.warn("Couldn't open browser. Copy this URL:");
        p.log.info(tweetUrl);
      }
    }
  }

  if (!quietMode) {
    p.outro("Share your wrapped!");
  }
  process.exit(0);
}

function generateTweetUrl(stats: AmpStats): string {
  const text = [
    `my ${stats.year} ampcode wrapped:`,
    ``,
    `${formatNumber(stats.totalThreads)} threads`,
    `${formatNumber(stats.totalMessages)} messages`,
    `${formatNumber(stats.totalTokens)} tokens`,
    `${stats.maxStreak} day streak`,
    ``,
    `get yours: npx ampcode-wrapped`,
  ].join("\n");

  const url = new URL("https://x.com/intent/tweet");
  url.searchParams.set("text", text);
  return url.toString();
}

async function openUrl(url: string): Promise<boolean> {
  const platform = process.platform;
  let command: string;
  let args: string[];

  if (platform === "darwin") {
    command = "open";
    args = [url];
  } else if (platform === "win32") {
    command = "cmd";
    args = ["/c", "start", "", url];
  } else {
    command = "xdg-open";
    args = [url];
  }

  try {
    const proc = Bun.spawn([command, ...args], {
      stdout: "ignore",
      stderr: "ignore",
    });
    await proc.exited;
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
