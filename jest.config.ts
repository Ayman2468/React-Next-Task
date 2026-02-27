import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',       // TS/TSX files
    '^.+\\.m?js$': 'babel-jest',       // ESM modules (MSW)
  },

  transformIgnorePatterns: [
    'node_modules/(?!(until-async|msw|@mswjs/interceptors)/)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};

export default config;
