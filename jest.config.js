module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    testMatch: ['**/src/**/*.spec.ts'],
    collectCoverage: true,
    coverageReporters: ['cobertura', 'text', 'text-summary'],
    setupFilesAfterEnv: ['<rootDir>/src/specs.ts'],
    collectCoverageFrom: [
        'src/**/*.{js,ts,jsx,tsx,vue}',
        '!**/node_modules/**',
        '!**/mocks/**',
        '!src/**/*.spec.{js,ts}',
        '!src/main.ts',
        '!src/background.ts',
        '!src/startups/socket.ts',
        '!src/startups/outlook-auth.ts',
        '!src/startups/element-ui-prod.js',
        '!src/store/index.ts'
    ],
    moduleNameMapper: {
        'azure-devops-node-api': '<rootDir>/src/mocks/third-party/azure-devops-node-api.ts',
        'axios': '<rootDir>/src/mocks/third-party/axios.ts',
        './features/zendesk/support-ticket-card/support-ticket-card': '<rootDir>/src/mocks/components/support-ticket-card.tsx',
        './features/azure-devops/build-pipeline-card/build-pipeline-card': '<rootDir>/src/mocks/components/build-pipeline-card.tsx',
        './features/azure-devops/release-pipeline-card/release-pipeline-card': '<rootDir>/src/mocks/components/release-pipeline-card.tsx',
        './features/github/commit-card/commit-card': '<rootDir>/src/mocks/components/commit-card.tsx',
        './features/github/pull-request-card/pull-request-card': '<rootDir>/src/mocks/components/pull-request-card.tsx'
    }
};
