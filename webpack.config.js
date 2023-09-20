const path = require('path');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /dist/],
            },
        ],
    },
    resolve: {
        extensions: ['.ts'],
    },
    plugins: [
        new WebpackConcatPlugin({
            bundles: [
                {
                    dest: './dist/video.js',
                    src: [
                        './node_modules/video.js/dist/video.min.js',
                        './node_modules/videojs-contrib-eme/dist/videojs-contrib-eme.min.js',
                    ],
                },
                {
                    dest: './dist/style.css',
                    src: [
                        './node_modules/video.js/dist/video-js.css',
                        './src/video-player/video-player.css',
                        './src/chromecast/chromecast-controls.css',
                    ],
                },
            ],
        }),
    ],
    experiments: {
        outputModule: true,
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'module',
        },
    },
    watchOptions: {
        ignored: /dist/,
        aggregateTimeout: 300,
    },
    devtool: 'source-map',
    devServer: {
        static: path.join(__dirname, 'dist'),
        compress: true,
        port: 4000,
    },
};
