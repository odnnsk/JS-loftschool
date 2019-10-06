let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
let rules = require('./webpack.config.rules');
let path = require('path');

// rules.push({
//     test: /\.css$/,
//     use: ExtractTextPlugin.extract({
//         fallback: 'style-loader',
//         use: 'css-loader'
//     })
// });


module.exports = {
    mode: 'development',
    devServer: {
        // index: 'index.html',
        host: 'localhost',
        contentBase: path.join(__dirname, "src"),
        port: 3000,
        // historyApiFallback: true,
        // hot: true,
        // watchContentBase: true,
        // inline: true,
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:8080',
        //         pathRewrite: {'^/api' : ''}
        //     }
        // }
    },
    entry: {
        main: [
            // 'webpack-hot-middleware/client?reload=true&timeout=1000',
            './src/index.js',
        ]
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve('dist'),
        // publicPath: '/',
        // publicPath: './src/index.js',
    },
    devtool: 'source-map',
    module: { rules },
    plugins: [
        // new ExtractTextPlugin('styles.css'),
        new webpack.LoaderOptionsPlugin({
            options: {
                handlebarsLoader: {}
            }
        }),
        new MiniCssExtractPlugin({
            filename: "[name]-styles.css",
            chunkFilename: "[id].css"
        }),
        new HtmlPlugin({
            title: 'Awesome Chat',
            template: './src/views/index.hbs',
            filename: 'index.html',
            // chunks: ['main']
        }),
        new CleanWebpackPlugin(['dist']),

        // new webpack.HotModuleReplacementPlugin(),
        // new webpack.NoEmitOnErrorsPlugin()




        // // new webpack.optimize.OccurenceOrderPlugin(),
        // new webpack.HotModuleReplacementPlugin(),
        // // new webpack.NoErrorsPlugin(),
    ]
};
