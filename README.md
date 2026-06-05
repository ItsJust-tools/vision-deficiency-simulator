# Vision Deficiency Simulator

A client-side WCAG accessibility tool for simulating vision deficiencies. Test how your designs, UI, and content appear to users with different visual conditions.

[![Version](https://img.shields.io/badge/Version-1.0.0-blue.svg)](https://github.com/ItsJust-tools/vision-deficiency-simulator)
[![CI](https://github.com/ItsJust-tools/vision-deficiency-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/ItsJust-tools/vision-deficiency-simulator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ItsJust-tools/vision-deficiency-simulator/blob/main/LICENSE)

## Features

- 🌈 **8 Vision Condition Simulations**:
  - **Normal vision** — baseline comparison
  - **Protanopia** — red-blindness (affects ~1% of males)
  - **Deuteranopia** — green-blindness (affects ~1% of males)
  - **Tritanopia** — blue-blindness (rare, affects blue/yellow perception)
  - **Achromatopsia** — complete color blindness (monochrome vision)
  - **Cataracts** — age-related lens clouding (blur, yellow tint)
  - **Glaucoma** — peripheral vision loss (radial vignette)
  - **Diabetic retinopathy** — retinal blood vessel damage
- 📷 **Image Upload**: Drag-and-drop or browse for screenshots to test
- 🎚️ **Intensity Control**: Adjust simulation strength from 0–100%
- 💾 **Export Results**: Download annotated screenshots as PNG, WebP, or PDF reports
- 🔗 **Share State**: Export/import simulation state via `.itsjust.json` files
- 🔒 **Privacy-First**: All processing happens in your browser — nothing is uploaded

## Why Use This Tool?

Accessibility isn't optional — it's essential. This simulator helps you:

- **Verify color contrast** for users with color vision deficiencies
- **Test non-color differentiation** — ensure your UI uses patterns, icons, and text labels
- **Meet WCAG 2.1 AA/AAA compliance** by proactively testing designs
- **Educate your team** about how real users experience your product

> 👀 **~4.5% of the global population** has some form of color vision deficiency. That's 1 in 22 men and 1 in 200 women.

## Quick Start

```bash
git clone https://github.com/ItsJust-tools/vision-deficiency-simulator.git
cd vision-deficiency-simulator
npm install

# Development server (Turbopack)
npm run dev

# Production build
npm run build
npm start

# Run tests
npm test
```

## Usage

1. **Upload an image** — drag-and-drop a screenshot/design onto the canvas, or click "Browse files"
2. **Select a condition** — choose from the dropdown in the toolbar
3. **Adjust intensity** — use the slider (0–100%) to control simulation strength
4. **Compare results** — toggle between conditions to see the difference
5. **Export** — download the simulation as a PNG/WebP image or PDF report
6. **Share** — export or share simulation state via `.itsjust.json`

## Environment Variables

| Variable          | Required       | Default                 | Description           |
| ----------------- | -------------- | ----------------------- | --------------------- |
| `NEXT_PUBLIC_URL` | For production | `http://localhost:3000` | Public deployment URL |

## How the Simulations Work

All simulations are applied client-side using CSS filter functions and overlay effects:

| Condition                | Technique                                         |
| ------------------------ | ------------------------------------------------- |
| **Protanopia**           | `hue-rotate(130deg) saturate(1.5)`                |
| **Deuteranopia**         | `hue-rotate(110deg) saturate(1.3)`                |
| **Tritanopia**           | `hue-rotate(-150deg) saturate(1.2)`               |
| **Achromatopsia**        | `grayscale(100%)`                                 |
| **Cataracts**            | `blur(1px) sepia(0.5) brightness(1.1)`            |
| **Glaucoma**             | CSS radial-gradient vignette overlay              |
| **Diabetic retinopathy** | `contrast(1.1) brightness(0.9) hue-rotate(-5deg)` |

> **Note**: These are approximations, not medical diagnostic tools. Real vision deficiencies vary per individual.

## Accessibility Features

This tool itself follows WCAG best practices:

- ♿ Full keyboard navigation — all controls are operable via keyboard
- ♿ Screen-reader support — semantic HTML and ARIA labels on all interactive elements
- ♿ `:focus-visible` outlines for keyboard users
- ♿ `prefers-reduced-motion` support
- ♿ `prefers-contrast: more` and forced-colors support
- ♿ Skip navigation link

## Project Structure

```
vision-deficiency-simulator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Server component entry
│   │   ├── tool-client.tsx     # Client component (state, wiring)
│   │   ├── layout.tsx          # Root layout with theme + toast
│   │   └── globals.css         # Global styles + theme tokens
│   ├── tool/
│   │   ├── tool.config.ts      # Tool metadata, features, theme
│   │   ├── tool-definition.ts  # State shape, serialize/deserialize
│   │   ├── types.ts            # VisionCondition, VisionFilter types
│   │   ├── template-metadata.ts
│   │   ├── components/
│   │   │   ├── tool-canvas.tsx   # Image display + filter overlay
│   │   │   ├── tool-toolbar.tsx  # Controls (condition, intensity)
│   │   │   └── tool-sidebar.tsx  # Info panel + WCAG guidelines
│   │   └── exporters/
│   │       ├── png.ts
│   │       ├── webp.ts
│   │       └── pdf.ts
│   └── lib/
│       └── seo.ts              # Metadata/JSON-LD generation
├── packages/core/              # @itsjust/core shared library
├── __tests__/
│   ├── unit/tool.spec.ts       # Unit tests
│   └── e2e/tool.spec.ts        # Playwright E2E tests
└── scripts/
    ├── preflight.mjs            # Template validation
```

## Scripts

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start dev server with Turbopack |
| `npm run build`      | Build core library + Next.js    |
| `npm start`          | Start production server         |
| `npm test`           | Run Vitest unit tests           |
| `npm run test:watch` | Run tests in watch mode         |
| `npm run test:e2e`   | Run Playwright E2E tests        |
| `npm run lint`       | Run ESLint                      |
| `npm run format`     | Format code with Prettier       |
| `npm run coverage`   | Run tests with coverage report  |

## Deployment

Build and run with Docker (recommended):

```bash
docker build -t itsjust-vision-deficiency-simulator .
docker run -p 3000:3000 -e NEXT_PUBLIC_URL=https://your-domain.com itsjust-vision-deficiency-simulator
```

Or deploy to any Node.js hosting that supports Next.js.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI:** React 19, [Tailwind CSS 4](https://tailwindcss.com/)
- **State:** `useToolState` hook with undo/redo support
- **Export:** `html-to-image` (PNG/WebP), native PDF blob
- **Testing:** [Vitest](https://vitest.dev/) (unit), [Playwright](https://playwright.dev/) (E2E)
- **Font:** Geist (Vercel)

## Contributing

Contributions welcome! Here's how to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run lint (`npm run lint`)
6. Commit and push
7. Open a Pull Request targeting `main`

See [open issues](https://github.com/ItsJust-tools/vision-deficiency-simulator/issues) for ideas.

## License

MIT - See [LICENSE](LICENSE) for details.

---

Built with ❤️ for accessibility. Every user deserves a great experience.
