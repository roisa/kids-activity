import { defineConfig } from 'vite';

const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2019',
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    open: false,
  },
});
