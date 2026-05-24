import { defineConfig } from 'vite';

// Repo name for GitHub Pages base path.
// Override at build time with: VITE_BASE=/my-repo/ npm run build
const base = process.env.VITE_BASE || '/kids-activity/';

export default defineConfig({
  base,
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2019',
  },
  server: {
    port: 5173,
    open: false,
  },
});
