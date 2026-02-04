import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false, // Run test files sequentially to avoid cleanup conflicts
  },
  resolve: {
    alias: {
      '@config': path.resolve(__dirname, 'src/config'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});
