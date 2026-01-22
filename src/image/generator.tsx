import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import { WrappedTemplate } from "./template";
import type { AmpStats } from "../types";
import { loadFonts } from "./fonts";
import { themes, formatConfigs, type ThemeName, type LayoutFormat } from "./design-tokens";

export interface GeneratedImage {
  fullSize: Buffer;
  displaySize: Buffer;
}

export interface GeneratedSvg {
  svg: string;
}

export type ImageFormat = "png" | "svg";

export interface GenerateImageOptions {
  format?: ImageFormat;
  theme?: ThemeName;
  layoutFormat?: LayoutFormat;
}

let wasmInitialized = false;

export async function generateImage(
  stats: AmpStats,
  options?: GenerateImageOptions
): Promise<GeneratedImage | GeneratedSvg> {
  const format = options?.format ?? "png";
  const theme = options?.theme ?? "dark";
  const layoutFormat = options?.layoutFormat ?? "default";
  const themeColors = themes[theme];
  const formatConfig = formatConfigs[layoutFormat];

  const svg = await satori(<WrappedTemplate stats={stats} theme={themeColors} layoutFormat={layoutFormat} />, {
    width: formatConfig.width,
    height: formatConfig.height,
    fonts: await loadFonts(),
  });

  if (format === "svg") {
    return { svg };
  }

  if (!wasmInitialized) {
    await initWasm(Bun.file(resvgWasm).arrayBuffer());
    wasmInitialized = true;
  }

  const [fullSize, displaySize] = [1, 0.75].map((v) => {
    const resvg = new Resvg(svg, { fitTo: { mode: "zoom", value: v } });
    return Buffer.from(resvg.render().asPng());
  });

  return { fullSize, displaySize };
}
