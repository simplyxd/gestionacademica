import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  server: { host: 'localhost', strictPort: true },
  preview: { host: 'localhost', strictPort: true },
});
