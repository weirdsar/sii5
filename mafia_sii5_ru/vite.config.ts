import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

/** Для GitHub Pages задайте `VITE_BASE=/имя-репо/` (с слэшем на конце). */
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [tailwindcss()],
  build: {
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: false,
  },
});
