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
        '!src/element-ui.js',
        '!src/main.ts',
        '!src/socket.ts',
        '!src/store/index.ts'
    ],
    moduleNameMapper: {
        'azure-devops-node-api': '<rootDir>/src/mocks/azure-devops-node-api.ts',
        'axios': '<rootDir>/src/mocks/axios.ts',
        'electron': '<rootDir>/src/mocks/electron.ts'
    }
};
