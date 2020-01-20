module.exports = {
    css: {
        requireModuleExtension: true
    },
    configureWebpack: {
        resolve: {
            extensions: ['.js', '.vue', '.json', '.ts', '.tsx']
        }
    },
    devServer: {
        port: 9005
    }
}
