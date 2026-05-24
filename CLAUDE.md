# itsjust Template — AI Assistant Guide

## Project Overview

Vision Deficiency Simulator - Simulate various vision deficiencies for accessibility testing. Preview designs, UI, and screenshots through simulated vision conditions like protanopia, deuteranopia, tritanopia, achromatopsia, cataracts, and more.

**Privacy-first** - All processing stays in your browser. Perfect for checking designs before shipping.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn-style components
- **State:** `useToolState` hook (custom, with undo/redo)
- **Testing:** Vitest (unit), Playwright (E2E)
- **Deployment:** Docker (self-hosted)

## Features

- **Vision Deficiency Simulation**: Protanopia, Deuteranopia, Tritanopia, Achromatopsia, Cataracts, Glaucoma, Diabetic Retinopathy
- **Screenshot Upload**: Drag and drop or click to upload screenshots for preview
- **Color Scheme Testing**: Test UI color combinations through different vision conditions
- **Slider Controls**: Adjust simulation intensity (0-100%)
- **Export Results**: Export annotated screenshots with simulation overlay
- **Share**: Share state via `.itsjust.json` files

## Monorepo Structure

```text
vision-deficiency-simulator/
├── src/                      # App source code
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Tool page (Server Component)
│   │   ├── tool-client.tsx   # Client component (main logic)
│   ├── tool/                 # Tool-specific code (CUSTOMIZE THIS)
│   │   ├── tool.config.ts    # Tool metadata & features
│   │   ├── tool-definition.ts # Tool contract (state, serialize, deserialize)
│   │   ├── template-metadata.ts # Locale, URL, PWA metadata
│   │   ├── types.ts          # Tool-specific types
│   │   ├── components/       # Canvas, Toolbar, Sidebar
│   │   └── exporters/        # Lazy-loaded exporters (png, pdf, ...)
│   └── lib/                  # Utilities (seo.ts, utils.ts, vision-filters)
├── packages/core/            # @itsjust/core (shared)
├── __tests__/                # App-level tests
└── scripts/                  # Preflight, bundle-size checks
```

## Creating a New Tool

1. Edit `src/tool/tool.config.ts` — set id, name, export formats
2. Replace `src/tool/tool-definition.ts` — state shape, serialize, deserialize
3. Edit `src/tool/template-metadata.ts` — locale, URL defaults
4. Replace `src/tool/components/` — canvas, toolbar, sidebar
5. Wire up `src/app/tool-client.tsx` and `src/app/page.tsx`
6. Replace `public/og.svg` — Open Graph image
7. Run `node scripts/preflight.mjs` to validate

## Environment Variables

```bash
NEXT_PUBLIC_URL=https://vision-deficiency-simulator.itsjust.tools
```

## Scripts

| Command                      | Description                 |
| ---------------------------- | --------------------------- |
| `npm run dev`                | Dev server (Turbopack)      |
| `npm run build`              | Build core + Next.js        |
| `npm test`                   | Vitest unit tests           |
| `npm run test:e2e`           | Playwright E2E              |
| `npm run lint`               | ESLint                      |
| `node scripts/preflight.mjs` | Validate template readiness |

## Vision Filters Implementation

The vision filters use CSS filter functions applied to an overlay canvas:

- **Protanopia**: `red: 0.567, green: 0.433, blue: 0.0`
- **Deuteranopia**: `red: 0.64, green: 0.36, blue: 0.0`
- **Tritanopia**: `red: 0.0, green: 0.457, blue: 0.543`
- **Achromatopsia**: Grayscale filter
- **Cataracts**: Blur + yellow tint filter
- **Glaucoma**: Radial dark vignette
- **Diabetic Retinopathy**: Noise + red-green channel reduction

## Important Conventions

- **No premature abstraction** — 3 similar lines > wrong abstraction
- **Client-side only** — no server-side processing for tool logic
- **Privacy-first** — user actions/data stay local in browser memory/storage
- **Zero signup** — tools work immediately, no auth required
- **Print-friendly** — CSS hides UI chrome when printing
- **Mobile-first** — toolbar icons only on mobile, full labels on desktop
- **Accessibility is mandatory** — all UI must preserve keyboard access, strong visible focus, semantic landmarks, and screen-reader support
- **Full-space canvas** — tool UI should use available viewport space

## Common Pitfalls

- Don't use `useEffect` for state updates — use `useCallback` with handlers
- Don't access `window` without `typeof window !== 'undefined'` check
- Don't commit `.env` files — use `.env.example` as template
- Don't add server dependencies to tool logic — keep it client-side
- Don't return `TState` directly from `deserialize` — always return `DeserializeResult<TState>`
- Don't forget to build `@itsjust/core` before building Next.js

## Testing

- Unit tests in `__tests__/unit/`
- E2E tests in `__tests__/e2e/`
- Use `renderTool()` from `@itsjust/core/testing` for component tests

## Deployment

```bash
docker build -t itsjust-vision-deficiency-simulator .
docker run -p 3000:3000 itsjust-vision-deficiency-simulator
```

## Agent Workflow Rules

- One tool, one purpose
- Privacy-first/client-only by default
- Accessibility is mandatory
- Keep UX simple
- Prefer smallest change that solves the request
- Commit and push regularly
- Never add Co-Authored-By trailers
