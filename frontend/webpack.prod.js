const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const webpack = require('webpack');

const mode = 'production';

module.exports = merge(common, {
    mode: mode,
    optimization: {
        minimizer: [new TerserJSPlugin({
            terserOptions: {
                format: {
                  comments: false,
                },
            },
            extractComments: false,
        }), new OptimizeCSSAssetsPlugin({})],
    },
    plugins:[
        new AddAssetHtmlPlugin({
            filepath: path.resolve(__dirname, 'src/config.js'),
            publicPath: ''
        }),
        new webpack.DefinePlugin({
            __MODE__: JSON.stringify(mode),
        }),
    ],
});