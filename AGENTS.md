# AGENTS.md — XROS-XYQ

## Quick commands

```bash
pnpm install                         # install all workspace deps
pnpm dev                             # dev all packages
pnpm build                           # build all
pnpm test                            # test all (stubs on serve/share)

# Focused commands (preferred for speed)
pnpm --filter @xros-xyq/web dev                        # Vite dev server on :3000
pnpm --filter @xros-xyq/web build                      # type-check + vite build (parallel)
pnpm --filter @xros-xyq/web type-check                 # vue-tsc only (project refs)
pnpm --filter @xros-xyq/web test:unit                  # vitest (jsdom)
pnpm --filter @xros-xyq/web test:e2e                   # playwright (auto-starts dev server)
pnpm --filter @xros-xyq/web lint                       # eslint --fix
pnpm --filter @xros-xyq/serve dev                      # tsx watch src/index.ts
pnpm --filter @xros-xyq/serve compress-image ./img.jpg --quality 85
```

## Stack & architecture

```
packages/
├── web/        Vue 3 + Vite 7 + Element Plus (dark) + Tailwind CSS 4 + Pinia
├── serve/      Node.js ESM + tsx + sharp (image compression CLI)
└── share/      stub — no code, no consumers yet
```

- **No inter-package imports exist yet.** `share/` and `serve/` are not consumed by `web/`.
- `@/` maps to `src/` inside packages/web (vite alias + tsconfig paths).

## Auto-imports (web)

Element Plus components and VueUse composables are **auto-imported** — do NOT write manual imports:

```vue
<!-- This works without importing -->
<ElButton type="primary" @click="toggle()" />
```

Note: Element Plus icons are registered globally in `main.ts`, so `<ElIcon><Search /></ElIcon>` also works without imports.

Generated files — do **not** edit manually:
- `packages/web/components.d.ts`
- `packages/web/auto-imports.d.ts`

## Styling (web)

- **Tailwind CSS v4** via `@tailwindcss/postcss` (the v4 PostCSS plugin). The old `tailwind.config.js` is present but barely used; v4 config is CSS-based.
- **Stylus** is used for `game.stylus` (game-themed styles).
- **Dark theme by default**: `element-plus/theme-chalk/dark/css-vars.css` loaded in `main.ts`.

## Testing

- **Unit**: `vitest` with `jsdom`, root `fileURLToPath(new URL('./', import.meta.url))`. Excludes `e2e/`.
- **E2E**: Playwright, 3 browsers (chromium/firefox/webkit). Dev server auto-starts on `:5173` (or `:4173` in CI). `headless` only in CI.
- No CI config exists (no `.github/` workflows).

## Environment

- `VITE_TITLE` sets the HTML `<title>` (committed `.env`, no secrets).
- Node ≥18 (root), ≥20.19 (web). pnpm ≥8.
- Root `"type": "module"` — ESM everywhere.
- Prettier: `semi: false`, `singleQuote: true`, `printWidth: 100`.

## Code conventions

- ESLint flat config (`eslint.config.ts`), Vue + TS + Prettier plugin.
- `@typescript-eslint/no-explicit-any` is disabled.
- Event bus pattern: `Emitter.class.ts` — custom event emitter used within the app.
- Formula system: `utils/formula/Formula.class.ts` wraps `expr-eval` (`expr-eval` is in root deps but used only in web).
- Store naming: `useXxxStore` → `stores/modules/xxx/` (Pinia with persistedstate plugin).
- Chinese comments throughout.

## Gotchas

- No build/test/lint scripts on root `package.json` for individual packages except `dev:web`, `build:web`, `preview:web`. Use `--filter` for others.
- `serve/` has no `src/index.ts` yet — `tsx watch src/index.ts` will fail without it.
- ESLint `"cwd"` is `.vscode/settings.json` `${workspaceFolder}/packages/web`. If adding eslint to other packages, update `eslint.workingDirectories`.
- `.vscode/node-wrapper.sh` routes ESLint extension through nvm-installed Node (v24.11.1). If Node version changes, update this file.
