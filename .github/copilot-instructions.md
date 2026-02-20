# Copilot Instructions

## Build, Test, and Lint

Package manager is **pnpm** (`pnpm@9.12.2`).

```bash
pnpm dev              # Dev server on port 3000
pnpm build            # TypeScript check + Vite build (tsc -b && vite build)
pnpm typecheck        # TypeScript only (tsc -b)
pnpm check            # Biome lint + format (auto-fix)
pnpm lint             # Biome lint only (auto-fix)
pnpm format           # Biome format only (auto-fix)
pnpm test             # Run all tests (vitest --run)
pnpm test:coverage    # Tests with coverage
pnpm storybook        # Storybook on port 6006
```

Run a single test file:

```bash
pnpm exec vitest --run tests/components/button.test.tsx
```

## Architecture

This is a Vite + React 18 SPA with TypeScript, Tailwind CSS, and React Router DOM.

- **Routing**: `src/routes.tsx` defines routes using `createBrowserRouter` with `basename` from `import.meta.env.BASE_URL`. Pages live in `src/pages/`.
- **UI components**: `src/components/ui-react-aria/` is a component library built on [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html) with Tailwind styling via `tailwind-variants` (`tv()`) and `tailwind-merge`. All components are re-exported from `src/components/ui-react-aria/index.ts`.
- **Layouts**: `src/layouts/` contains route layout wrappers using React Router's `<Outlet />`.
- **Storybook**: Stories live in `stories/` (not co-located with components) and cover the React Aria component library.
- **Tests**: Tests live in `tests/` mirroring the source structure (`tests/page/`, `tests/components/`). Test environment is `happy-dom`. Setup file: `tests/setup-test.ts`.

## Key Conventions

- **Path aliases**: Use `#/` for `src/` imports and `~/` for `public/` imports (e.g., `import Home from '#/pages/home'`).
- **Biome** (not ESLint/Prettier): Configured in `biome.json`. JS/TS uses 2-space indent, single quotes, no semicolons, trailing commas (ES5). Unused imports/variables are errors. Tailwind class sorting is enforced via `useSortedClasses`.
- **Tailwind utilities**: Use `twMerge` for merging class names and `tv()` from `tailwind-variants` for component variant styling. The `ctrp` helper in `ui-react-aria/utils.ts` composes React Aria render props with Tailwind classes.
- **Environment variables**: Must be prefixed with `VITE_`. See `.env.example` for required vars.
- **Pre-commit hooks**: Lefthook runs Biome format/check/lint, typecheck, and tests on commit.
- **Dark mode**: Tailwind uses `class` strategy (`darkMode: 'class'`).
- **TypeScript**: Strict mode with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` (use `import type` for type-only imports).
