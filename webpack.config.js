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
    entry: {
        main: './src/index.js',
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve('dist')
    },
    devServer: {
        // index: 'index.html',
        contentBase: path.join(__dirname, "src"),
        port: 3000,
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
            title: 'YA Maps API',
            template: './src/views/index.hbs',
            filename: 'index.html',
            // chunks: ['main']
        }),
        new CleanWebpackPlugin(['dist'])
    ]
};
