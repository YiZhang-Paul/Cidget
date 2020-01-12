module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ]
}

if (process.env.NODE_ENV === 'test') {
    module.exports.plugins = ['babel-plugin-istanbul'];
}
