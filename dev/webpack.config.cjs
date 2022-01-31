const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ProvidePlugin } = require('webpack')

module.exports = {
  mode: 'development',
  entry: './dev/react-app.tsx',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  output: {
    publicPath: '/',
  },
  module: {
    rules: [
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
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:3000',
    },
    port: 4000,
  },
}
