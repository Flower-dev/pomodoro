<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Qué qu'on mange ?

Single-page French restaurant randomizer. Weighted spinner picks a restaurant based on `appreciation * (6 - recurrence)`. No backend, no database — all state is client-side React state seeded from `data/restaurants.json`.

## Stack

- **Next.js 16.2** (App Router), React 19, TypeScript 5 (strict)
- **Tailwind CSS v4** via `@tailwindcss/postcss` — no `tailwind.config.*` file; theme is in `app/globals.css` using `@theme inline`
- **shadcn/ui** (radix-luma style, lucide icons) — add components via `npx shadcn add <name>`
- Path alias: `@/*` maps to repo root

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run dev` (port 3000) |
| Build | `npm run build` |
| Lint | `npm run lint` (eslint, flat config) |
| Docker dev | `docker compose up` (port 3001 -> 3000) |

No test framework is configured. No formatter config beyond ESLint.

## Key files

- `app/page.tsx` — entire app UI (client component), spinner logic, CRUD for restaurants
- `data/restaurants.json` — seed data, imported statically at build time
- `app/globals.css` — Tailwind v4 theme config + custom `animate-blob` utility
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `components/ui/` — shadcn components

## Conventions

- UI language is **French**. Keep labels, descriptions, and placeholder text in French.
- Custom CSS animations use Tailwind v4 `@utility` syntax (not the v3 `theme.extend` pattern).
- The app is a single `'use client'` page. There are no API routes or server actions.
