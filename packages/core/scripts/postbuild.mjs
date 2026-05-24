import { writeFileSync } from "fs";

// Create proxy index.js with 'use client' directive that re-exports the ESM bundle.
// This is required because tsup/esbuild bundling strips 'use client' directives
// when CJS interop (e.g., lz-string) forces chunk generation.
writeFileSync("dist/index.js", "'use client';\nexport * from './index.mjs';\n");
