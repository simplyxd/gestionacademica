import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Levantar la base de datos temporal tarda unos segundos (más la primera vez).
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
