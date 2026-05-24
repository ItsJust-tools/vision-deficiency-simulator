import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/tool/exporters/**',
        'src/**/*.test.{ts,tsx}',
        'src/*.{test,spec}.ts',
        '**/.git/**',
        '**/node_modules/**',
      ],
    },
  },
});
