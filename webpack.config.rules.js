const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require('autoprefixer');

// const isDevelopment = process.env.NODE_ENV !== 'production';
const isDevelopment = true;

module.exports = [
    {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: { cacheDirectory: true }
    },
    {
        test: /\.hbs/,
        loader: 'handlebars-loader',
        query: { inlineRequires: '\/img\/' }
    },
    {
        test: /\.(scss|css)$/,
        use: [
            MiniCssExtractPlugin.loader,
            {
                loader: "css-loader",
                options: {
                    sourceMap: isDevelopment,
                    minimize: !isDevelopment,
                    hmr: true,
                    reloadAll: true,
                }
            },
            {
                loader: "postcss-loader",
                options: {
                    autoprefixer: {
                        browsers: ["last 2 versions"]
                    },
                    sourceMap: isDevelopment,
                    plugins: () => [
                        autoprefixer
                    ]
                },
            },
            {
                loader: "sass-loader",
                options: {
                    sourceMap: isDevelopment
                }
            }
        ]
    },

    // {
    //     test: /\.(scss|css)$/,
    //     use: [
    //         MiniCssExtractPlugin.loader,
    //         {
    //             loader: "css-loader",
    //             options: {
    //                 sourceMap: isDevelopment,
    //                 minimize: !isDevelopment
    //             }
    //         },
    //         {
    //             loader: "postcss-loader",
    //             options: {
    //                 autoprefixer: {
    //                     browsers: ["last 2 versions"]
    //                 },
    //                 sourceMap: isDevelopment,
    //                 plugins: () => [
    //                     autoprefixer
    //                 ]
    //             },
    //         },
    //         {
    //             loader: "sass-loader",
    //             options: {
    //                 sourceMap: isDevelopment
    //             }
    //         }
    //     ]
    // },
    {
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2)$/i,
        loader: 'file-loader',
        options: {
            // name: '[hash:8].[ext]',
            name: '[name].[ext]',
            outputPath: 'assets/'
        }
    }
];
