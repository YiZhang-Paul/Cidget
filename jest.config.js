module.exports = {
    preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
    collectCoverage: true,
    coverageReporters: ['cobertura', 'text', 'text-summary'],
    collectCoverageFrom: [
        'src/**/*.{js,ts,jsx,tsx,vue}',
        '!**/node_modules/**',
        '!src/background.ts',
        '!src/element-ui.js',
        '!src/main.ts',
        '!src/store/index.ts'
    ]
};
