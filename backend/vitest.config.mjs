import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // El backend es CommonJS y vitest no se puede cargar con require(): los tests usan los globales.
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.js', 'tests/**/*.test.js', '../db/seed/**/*.test.js'],
    // La primera ejecución descarga el binario de MongoDB para mongodb-memory-server.
    hookTimeout: 120_000,
  },
});
