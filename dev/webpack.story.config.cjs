const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ProvidePlugin } = require('webpack')

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
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
        },
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `<div id='container'></div>`,
    }),
    new ProvidePlugin({
      React: 'react',
    }),
  ],
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
    port: 5000,
  },
}
