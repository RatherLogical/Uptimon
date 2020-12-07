const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

const mode = 'development';

module.exports = merge(common, {
   mode: mode,
   entry: ['./src/config.js'],
   devtool: 'inline-source-map',
   devServer: {
     contentBase: './dist',
   },
   plugins: [
    new webpack.DefinePlugin({
      __MODE__: JSON.stringify(mode),
    }),
   ],
});