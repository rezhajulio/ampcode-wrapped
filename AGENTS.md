# AGENTS.md - ampcode-wrapped

## Commands
- **Start**: `bun start` - Run the CLI tool
- **Dev**: `bun run --watch src/index.ts` - Watch mode for development
- **Build**: `bun build src/index.ts --outdir dist --target bun`
- **Type check**: `bun run typecheck` or `tsc --noEmit`

## CLI Flags
`--year <YYYY>`, `--output/-o <path>`, `--theme <dark|light>`, `--svg`, `--json`, `--yes/-y`, `--quiet/-q`, `--no-clipboard`, `--no-terminal-image`

## Architecture
Spotify Wrapped-style stats visualization for Amp usage. Single-purpose CLI tool.

**Core Flow**: Collector (`collector.ts`) → Stats (`stats.ts`) → Generator (`image/generator.tsx`) → Display/Share
- `types.ts` - Thread/Message data structures, AmpStats interface (includes peakHourPersona, longestThread, avgTokensPerDay)
- `image/` - React template, design-tokens.ts (dark/light themes), heatmap visualization
- `terminal/` - Inline image rendering; `clipboard/` - macOS/Linux clipboard

## Code Style
- **TypeScript**: `strict: true`, no `any` types, ESM imports
- **Naming**: camelCase functions, PascalCase types, SCREAMING_SNAKE_CASE constants
- **Async/IO**: Use async/await with Bun.file(); use native Map for collections
- **React**: JSX with Satori (no hooks), inline style objects, useTheme() for colors
- **Errors**: Throw descriptive errors, let main catch and display
