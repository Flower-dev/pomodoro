# AGENTS.md

## Project

Next.js 16 app with static export, deployed to GitHub Pages. Package name is `quequonmange` (food/meal planning app). `app/layout.tsx` and `app/page.tsx` are currently empty — project is early stage.

## Commands

```bash
npm run dev       # dev server (port 3000)
npm run build     # static export → out/
npm run lint      # eslint v9 flat config
npx tsc --noEmit  # typecheck (no script alias)
```

No test runner is configured yet. When tests are added, use **Vitest + React Testing Library** (see `.opencode/commands/write_tests.md`).

## Static Export

`next.config.ts` sets `output: "export"`. This means:
- No Server Actions, API routes, Image Optimization, or ISR
- Build output goes to `out/`
- When `GITHUB_PAGES=true`, `basePath` is `/qu-quonmange` — account for this in internal links

## Toolchain Quirks

- **Tailwind v4**: No `tailwind.config.js`. Config lives in `app/globals.css` via `@tailwindcss/postcss`.
- **shadcn style `radix-luma`**: Uses the unified `radix-ui` package (not individual `@radix-ui/*` packages). See `components.json`.
- **ESLint v9 flat config**: `eslint.config.mjs` uses `defineConfig`/`globalIgnores`.
- **Docker**: `--legacy-peer-deps` used; dev container maps port 3001→3000 with volume mount.

## Testing (when added)

Per `.opencode/commands/write_tests.md`:
- Files go in `__tests__/` subdirectory alongside source
- Naming: `[filename].test.ts(x)`
- Use `@/` path alias for imports

## Design Conventions

The `frontend-design` skill (`.opencode/skills/frontend-design/SKILL.md`) mandates bold/distinctive UI — avoid generic AI aesthetics, avoid Inter/Roboto/Arial/Space Grotesk. Use Motion library for animations.

The `brainstorming` skill requires an approved spec in `specs/<name>.md` before writing code for new features.
