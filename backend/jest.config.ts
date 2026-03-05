import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.', // Raíz del proyecto
  testMatch: ['**/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/Entities/**',
    '!src/**/dto/**',
    '!src/common/**',
    '!src/logger/logger.ts',
    '!src/app.**.**',
    '!src/Modules/auth/decoradores/**',
    '!src/Modules/auth/estrategias/**',
    '!src/Modules/auth/guards/**',
    '!src/Modules/auth/interfaces/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text', 'text-summary'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};

export default config;
