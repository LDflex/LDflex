// Copied from: https://github.com/comunica/comunica/blob/master/packages/actor-init-sparql/webpack.config.js
const path = require('path');
const ProgressPlugin = require('webpack').ProgressPlugin;
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: [ path.resolve(__dirname, 'src', 'index.js') ],
  output: {
    filename: 'ldflex-browser.js',
    path: __dirname,
    libraryTarget: 'var',
    library: 'LDflex'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ]
  },
  plugins: [
    new NodePolyfillPlugin(),
    new ProgressPlugin(),
  ]
};
