const path = require('path')

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

if (process.env.NODE_ENV === 'test') {
    module.exports.configureWebpack.module = {
        rules: [
            {
                test: /\.(j|t)s?$/,
                enforce: 'post',
                include: path.resolve('./src'),
                exclude: [/\.d.ts$/],
                loader: 'istanbul-instrumenter-loader',
                options: {
                    esModules: true
                }
            }
        ]
    }
}
