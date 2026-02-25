# Vite React Template

Production-ready starter combining **React 18**, **Vite**, **TypeScript** (strict mode), and **Tailwind CSS**. Includes a comprehensive [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html) UI library with **40+ accessible components** and extensive [Storybook](https://storybook.js.org/) coverage.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Core** | [React 18](https://react.dev/) · [Vite](https://vitejs.dev/) · [TypeScript](https://www.typescriptlang.org/) (strict) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) · [tailwind-variants](https://www.tailwind-variants.org/) · [tailwind-merge](https://github.com/dcastil/tailwind-merge) |
| **UI Library** | [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html) · [Lucide Icons](https://lucide.dev/) |
| **Navigation** | [React Router DOM](https://reactrouter.com/) |
| **Quality** | [Biome](https://biomejs.dev/) (lint & format) · [Lefthook](https://github.com/evilmartians/lefthook) (git hooks) |
| **Testing** | [Vitest](https://vitest.dev/) · [React Testing Library](https://testing-library.com/) · [happy-dom](https://github.com/nicedoc/happy-dom) |
| **Documentation** | [Storybook](https://storybook.js.org/) |

## Getting Started

> **Prerequisite:** [pnpm](https://pnpm.io/) v9+ — declared via `packageManager` field in `package.json`.

```bash
# Scaffold from this template
npx tiged six7/vite-react-template my-app && cd my-app

# Install and run
pnpm install
pnpm dev          # → http://localhost:3000
```

### Scripts

```text
pnpm dev              Start dev server with hot reload
pnpm build            TypeScript check + Vite production build
pnpm preview          Serve the production build locally
pnpm test             Run all tests (vitest)
pnpm test:coverage    Tests with coverage report
pnpm storybook        Launch Storybook on port 6006
pnpm check            Biome lint + format with auto-fix
pnpm typecheck        TypeScript type-checking only
```

## Project Structure

```text
src/
├── assets/            Static assets (images, global styles)
├── components/
│   └── ui-react-aria/ 40+ accessible UI components (Button, Dialog, Table, …)
│       ├── index.ts   Barrel re-export for all components
│       └── utils.ts   Helpers — ctrp(), twMerge wrappers
├── layouts/           Route layout wrappers (uses <Outlet />)
├── pages/             Page-level components
├── routes.tsx         Router config via createBrowserRouter
└── main.tsx           Application entry point

stories/               Storybook stories (mirrors ui-react-aria/)
tests/                 Test files (mirrors src/ structure)
```

## Conventions

- **Path aliases** — `#/` → `src/`, `~/` → `public/` (e.g. `import { Button } from '#/components/ui-react-aria'`).
- **Dark mode** — Tailwind `class` strategy (`darkMode: 'class'`).
- **Linting & formatting** — Handled by [Biome](https://biomejs.dev/) (not ESLint/Prettier). Config lives in [`biome.json`](./biome.json). Uses 2-space indent, single quotes, no semicolons.
- **Component variants** — Use `tv()` from `tailwind-variants` for variant styles and `twMerge` for merging class names.
- **Env variables** — Must be prefixed with `VITE_`. See [`.env.example`](./.env.example) for required values.
- **Git hooks** — [Lefthook](https://github.com/evilmartians/lefthook) runs Biome checks, typecheck, and tests before each commit.
- **TypeScript** — Strict mode enabled with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (use `import type` for type-only imports).

## Deployment

Fork this repository and connect to your hosting platform of choice.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/six7/vite-react-template&project-name=vite-react-template&repo-name=my-vite-react-app&env=VITE_PUBLIC_SITE_URL)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/six7/vite-react-template)

## License

Dual-licensed under [Apache 2.0](./LICENSE-APACHE) or [MIT](./LICENSE-MIT), at your option. Copyrights are retained by their contributors.
