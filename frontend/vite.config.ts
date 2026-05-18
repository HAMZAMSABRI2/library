import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'clover'],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/main.ts'],
    },
  },
});
