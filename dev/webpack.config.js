const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './dev/client-fetch.ts',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  devServer: {
    static: './dev',
    proxy: {
      '/api': 'http://localhost:3000',
    },
    port: 4000,
  },
}
