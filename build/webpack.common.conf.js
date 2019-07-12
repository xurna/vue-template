const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')
const process = require('process')
const webpack = require('webpack')
const nodeModuleDir = path.resolve(process.cwd(), 'node_module')
const appDir = path.resolve(process.cwd(), 'app')
console.log(process.cwd(),appDir)
function resolve(dir){
  return path.join(appDir, dir)
}
module.exports = {
  entry: { 'app': resolve('main.js') },
  resolve: {
    extensions: ['.js', '.vue', '.less', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': appDir,
      'js': resolve('assets/js'),
      'less': resolve('assets/less'),
      'img': resolve('assets/images'),
      'cmp': resolve('components'),
      'page': resolve('pages'),
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [appDir],
        exclude: [nodeModuleDir]
      },
      {
        test: /\.js$/,
        use: ['babel-loader'],
        include: [appDir],
        exclude: [nodeModuleDir]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
          loader: 'url-loader', // file-loader
          options: { limit: 2500 }
        }],
        include: [appDir],
        exclude: [nodeModuleDir]
      }
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({ __DEV__: JSON.stringify(JSON.parse(process.env.NODE_ENV || 'true')) })

  ],
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}