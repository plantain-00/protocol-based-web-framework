const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: './dev/story-app.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  output: {
    publicPath: '/',
  },
  module: {
    rules: [
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `<div id='container'></div>`,
    })
  ],
  devServer: {
    historyApiFallback: {
      disableDotRule: true,
    },
    proxy: {
      '/api': 'http://localhost:3000',
    },
    port: 5000,
  },
}
