module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    testMatch: ['**/src/**/*.spec.ts'],
    collectCoverage: true,
    coverageReporters: ['cobertura', 'text', 'text-summary'],
    collectCoverageFrom: [
        'src/**/*.{js,ts,jsx,tsx,vue}',
        '!**/node_modules/**',
        '!src/**/*.spec.{js,ts}',
        '!src/background.ts',
        '!src/element-ui.js',
        '!src/main.ts',
        '!src/socket.ts',
        '!src/store/index.ts'
    ]
};
