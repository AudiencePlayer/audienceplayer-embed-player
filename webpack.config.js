import path from 'path';
import {fileURLToPath} from 'url';
import WebpackConcatPlugin from 'webpack-concat-files-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
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
    // Prevents bundling peer dependencies
    externals: {
        'video.js': 'video.js',
        'videojs-contrib-eme': 'videojs-contrib-eme',
    },
    plugins: [
        new WebpackConcatPlugin({
            bundles: [
                {
                    dest: './dist/videojs-packaged.js',
                    src: [
                        './node_modules/video.js/dist/video.min.js',
                        './node_modules/videojs-contrib-eme/dist/videojs-contrib-eme.min.js',
                    ],
                },
                {
                    dest: './dist/style.css',
                    src: ['./src/video-player/video-player.css', './src/chromecast/chromecast-controls.css'],
                },
                {
                    dest: './dist/videojs-packaged.css',
                    src: ['./node_modules/video.js/dist/video-js.css'],
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
        clean: true,
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
