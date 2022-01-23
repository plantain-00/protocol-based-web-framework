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
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.26.0/themes/prism.css" integrity="sha512-jtWR3pdYjGwfw9df601YF6uGrKdhXV37c+/6VNzNctmrXoO0nkgHcS03BFxfkWycOa2P2Nw9Y9PCT9vjG9jkVg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<div id='container'></div>`,
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
