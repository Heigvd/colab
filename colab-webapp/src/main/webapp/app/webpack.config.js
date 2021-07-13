const path = require('path');

module.exports = {
    entry: './src/components/App.tsx',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.svg$/,
                use: ['@svgr/webpack']
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader','css-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        stats: 'errors-warnings',
        host: '0.0.0.0',
        port: 3004,
        overlay: true,
        publicPath: '/dist',
        proxy: {
            '/favicon_128.png': 'http://localhost:8080',
            '/api': 'http://localhost:8080',
            '/ws': {
                target: 'ws://localhost:8080',
                ws: true
            }
        }
    }
};
