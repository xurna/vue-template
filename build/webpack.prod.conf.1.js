const commonConfig = require('./webpack.common.conf')
const webpackMerge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const path = require('path')
const process = require('process')
const nodeModuleDir = path.resolve(process.cwd(), 'node_module')
const appDir = path.resolve(process.cwd(), 'app')
const outputPath = path.resolve(process.cwd(), 'dist')
const assestPathName = 'assets'
const config = webpackMerge(commonConfig, {
  mode: 'production',
  output: {
    path: outputPath,
    chunkFilename: assestPathName + `/[name].[chunkhash:5].js`,
    publicPath: '',
    filename: assestPathName + `/[name].js`
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          compress: { drop_console: true },
          output: { comments: false }
        }
      }),
      // 相比uglifyjs，terser能支持es6+的语法
      // new TerserPlugin({
      //   // cache: true,
      //   // parallel: true, // 开启并行压缩，充分利用cpu
      //   // sourceMap: false,
      //   // terserOptions: {
      //   //   compress: { drop_console: true },
      //   // }
      // }),
      new OptimizeCSSAssetsPlugin({})
    ],
    runtimeChunk: { name: 'runtime' }, // 分离出webpack编译运行时的代码
    splitChunks: {
      chunks: 'all', //同时分割同步和异步代码,推荐
      minSize: 30000,  // 压缩前的最小模块大小，默认是30kb
      minChunks: 1, // 表示被引用次数，默认为1
      maxAsyncRequests: 5, // 最大的按需(异步)加载次数，默认为5
      maxInitialRequests: 3, // 最大的初始化加载次数，默认为3
      name: true,
      cacheGroups: { //缓存策略，设置缓存组用来抽取满足不同规则的chunk
        vendors: { // 缓存组默认将node_modules中的模块拆分带一个叫做vendors的代码块中，将最少重复引用两次的模块放入default中
          name: 'vendors',
          test: /[\/]node_modules[\/]/,
          priority: -10
        },
        default: {
          name: 'default',
          minChunks: 2, //最少被几个chunk引用，默认为1
          priority: -20, // 优先级，一个chunk很可能满足多个缓存组，会被抽取到优先级高的缓存组中
          reuseExistingChunk: true, // 如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
        }
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    // // 从js中提取css，目前缺失HMR，所以只能在生成环境中使用
    // new MiniCssExtractPlugin({
    //   filename: assestPathName + `/[name].[chunkhash:5].css`,
    //   chunkFilename: assestPathName + `/[name].[chunkhash:5].css`,
    // }),
    new HtmlWebpackPlugin({
      filename: path.resolve(process.cwd(), `dist/index.html`),
      title: '',
      template: path.join(appDir, 'index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: true
      },
      inject: true, // 资源注入模板
      // chunks: ['runtime', 'vendors', 'default', 'app'] // 将runtime插入html中
    }),
    // new InlineManifestWebpackPlugin('runtime') // 将运行代码直接插入html文件中，因为这段代码非常少，这样做可以避免一次请求的开销
  ],
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: [
          // MiniCssExtractPlugin.loader,
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2, // 0 => no loaders (default); 2 => postcss-loader, less-loader
            },
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: [
                require("autoprefixer")
              ]
            }
          }, // 位置不可与less-loader反过来，因为是从下到上做处理的
          'less-loader',
        ],
        include: [appDir],
        exclude: [nodeModuleDir]
      },
    ]
  }
})
module.exports = config