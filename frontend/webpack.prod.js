const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
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
});