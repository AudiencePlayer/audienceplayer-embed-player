import path from 'path';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';
import WebpackConcatPlugin from 'webpack-concat-files-plugin';
import {compile} from 'sass';

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Compiles each .scss source file to CSS before it's concatenated into the bundle.
const compileScss = (content, filepath) => {
    if (!filepath.endsWith('.scss')) {
        return content;
    }
    return compile(filepath, {style: 'expanded', charset: false}).css;
};

export default {
    entry: {
        bundle: './src/index.ts',
        logging: './src/logging/index.ts',
    },
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
                        require.resolve('video.js/dist/video.min.js'),
                        require.resolve('videojs-contrib-eme/dist/videojs-contrib-eme.min.js'),
                    ],
                },
                {
                    dest: './dist/style.css',
                    src: [
                        './src/video-player/video-player.scss',
                        './src/chromecast/chromecast-controls.scss',
                        './src/video-player/responsive-skin.scss',
                    ],
                    transforms: {
                        before: compileScss,
                    },
                },
                {
                    dest: './dist/videojs-packaged.css',
                    src: [require.resolve('video.js/dist/video-js.css')],
                },
            ],
        }),
    ],
    experiments: {
        outputModule: true,
    },
    output: {
        filename: '[name].js',
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
