import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 120000, // 2 minutes for canister tests
    hookTimeout: 120000,
    include: ['test/**/*.test.ts'],
    globalSetup: ['./test/global-setup.ts'],
  },
});
