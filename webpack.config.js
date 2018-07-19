const HtmlWebpackPlugin = require('html-webpack-plugin')
const loading = require('./render-loading')

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'index_bundle.js'
  },
  plugins: [

    new HtmlWebpackPlugin({
      template: './index.html',
      loading: loading
    })
  ]
}
