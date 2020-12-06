var HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
var path = require('path');

const HtmlWebpackPluginConfig = {
    template: 'index.html'
}

const MiniCssExtractPluginConfig = {
    filename: 'css/[name].[contenthash].css'
}

module.exports = {
    // entry: {
    //     app: './src/index.js',
    // },
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
                loader: 'file-loader',
                options: {
                    publicPath: '../',
                    name: 'font/[name].[contenthash].[ext]',
                },
            },
            {
                test: /\.(png|jpg|jpeg)$/,
                loader: 'file-loader',
                options: {
                    publicPath: './',
                    name: 'img/[name].[contenthash].[ext]',
                },
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(HtmlWebpackPluginConfig),
        new MiniCssExtractPlugin(MiniCssExtractPluginConfig)
    ],
};