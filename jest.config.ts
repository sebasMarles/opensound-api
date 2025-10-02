import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageDirectory: 'coverage',
  clearMocks: true,
  setupFiles: ['<rootDir>/tests/env.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};

export default config;
