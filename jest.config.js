module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    testMatch: ['**/src/**/*.spec.ts'],
    collectCoverage: true,
    coverageReporters: ['cobertura', 'text', 'text-summary'],
    collectCoverageFrom: [
        'src/**/*.{js,ts,jsx,tsx,vue}',
        '!**/node_modules/**',
        '!**/mocks/**',
        '!src/**/*.spec.{js,ts}',
        '!src/background.ts',
        '!src/element-ui-non-test.js',
        '!src/main.ts',
        '!src/socket.ts',
        '!src/store/index.ts'
    ],
    moduleNameMapper: {
        'azure-devops-node-api': '<rootDir>/src/mocks/third-party/azure-devops-node-api.ts',
        'axios': '<rootDir>/src/mocks/third-party/axios.ts',
        'electron': '<rootDir>/src/mocks/third-party/electron.ts',
        './features/azure-devops/build-pipeline-card/build-pipeline-card': '<rootDir>/src/mocks/components/build-pipeline-card.tsx',
        './features/azure-devops/release-pipeline-card/release-pipeline-card': '<rootDir>/src/mocks/components/release-pipeline-card.tsx',
        './features/github/commit-card/commit-card': '<rootDir>/src/mocks/components/commit-card.tsx',
        './features/github/pull-request-card/pull-request-card': '<rootDir>/src/mocks/components/pull-request-card.tsx'
    }
};
