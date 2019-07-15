const commonConfig = require('./webpack.common.conf')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
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
const assestPathName = 'static'
const config = webpackMerge(commonConfig, {
  mode: 'production',
  output: {
    path: outputPath,
    chunkFilename: assestPathName + `/js/[name].[chunkhash:8].js`,
    publicPath: '',
    filename: assestPathName + `/js/[id].[chunkhash].js`
  },
  optimization: {
    minimizer: [
      // 相比uglifyjs，terser能支持es6+的语法
      new TerserPlugin({
        cache: true,
        parallel: true, // 开启并行压缩，充分利用cpu
        sourceMap: false,
        terserOptions: {
          compress: { drop_console: true },
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
    // 为每个入口提取出webpack runtime模块
    runtimeChunk: { name: 'manifest' },
    // 采用splitChunks提取出entry chunk的chunk Group
    splitChunks: {
      chunks: 'all', //同时分割同步和异步代码,推荐
      cacheGroups: {
        // 处理入口chunk
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial', //初始化代码块
          name: 'vendors',
          // reuseExistingChunk: true, // 如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
        },
        // 处理异步chunk
        'async-vendors': {
          test: /[\\/]node_modules[\\/]/,
          minChunks: 2, //最少被几个chunk引用，默认为1, 防止打包太多文件
          chunks: 'async', // 按需加载代码块
          name: 'async-vendors',
          reuseExistingChunk: true,  // 如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
        },
      }
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    // 从js中提取css，目前缺失HMR，所以只能在生成环境中使用
    new MiniCssExtractPlugin({
      filename: assestPathName + `/css/[name].[contenthash:8].css`,
      chunkFilename: assestPathName + `/css/[id].[chunkhash:8].css`, // ???
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html', // 根路径是output.path
      template: path.join(appDir, 'index.html'),
      title: '',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        conservativeCollapse: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      // chunksSortMode: 'dependency'
      chunks: ['manifest', 'vendors', 'async-vendors', 'app']
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    new InlineManifestWebpackPlugin('manifest') // 将运行代码直接插入html文件中，因为这段代码非常少且时常改动，这样做可以避免一次请求的开销
  ],
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
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
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
          loader: 'url-loader', // 需要安装file-loader
          options: {
            limit: 10000,
            name: '[name].[hash:8].[ext]',
            outputPath: assestPathName + '/img/',
            publicPath: '',
          },
        }],
        include: [appDir],
        exclude: [nodeModuleDir]
      }
    ]
  },
  // 打印打包信息配置
  stats: {
    colors: true,
    modules: false,
    children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
    chunks: false,
    chunkModules: false,
  }
})
module.exports = config