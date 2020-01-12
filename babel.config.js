module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    plugins: [
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining"
    ]
}

if (process.env.NODE_ENV === 'test') {
    module.exports.plugins = ['babel-plugin-istanbul'];
}
