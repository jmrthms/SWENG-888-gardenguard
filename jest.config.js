/**
 * Jest config for GardenGuard's pure data/logic layer. Uses @swc/jest (not
 * babel-preset-expo) so the test toolchain is fully decoupled from the Metro
 * build — these tests cover the recommendation engine, catalog, and helpers,
 * none of which import React Native or Expo native modules.
 *
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  clearMocks: true,
};
