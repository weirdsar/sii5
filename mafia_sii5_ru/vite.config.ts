import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: false,
  },
});
