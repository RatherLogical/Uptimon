const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const path = require('path');

const HtmlWebpackPluginConfig = {
    inject: true,
    template: 'index.html'
}

const MiniCssExtractPluginConfig = {
    filename: 'css/[name].[contenthash].css'
}

module.exports = {
    entry: ['@babel/polyfill', './src/index.js'],
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: ['html-loader']
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader',
                ],
            },
            {
                test: /\.(svg|eot|woff|woff2|ttf)$/,
                exclude: /(img)/,
                loader: 'file-loader',
                options: {
                    publicPath: '../',
                    name: 'font/[name].[contenthash].[ext]',
                },
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                exclude: /(fonts)/,
                loader: 'file-loader',
                options: {
                    publicPath: '../',
                    name: 'img/[name].[ext]',
                },
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(HtmlWebpackPluginConfig),
        new MiniCssExtractPlugin(MiniCssExtractPluginConfig),
        new FaviconsWebpackPlugin({
            logo: './src/img/favicon.png', // svg works too!
            outputPath: 'img/assets',
            prefix: 'img/assets/',
            mode: 'webapp',
            favicons: {
              appName: 'Uptimon',
              appDescription: 'Uptimon Service Status',
              developerName: 'Uptimon',
              developerURL: null, // prevent retrieving from the nearest package.json
              background: '#212121',
              theme_color: '#00ff00',
              appleStatusBarStyle: "black-translucent",
              display: "standalone",
              icons: {
                coast: false,
                yandex: false
              }
            }
        })
    ],
};