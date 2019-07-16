# vue-test
vue function base 尝试，开发环境搭建

## 步骤
- 装依赖
  - 工具包
    ```
    npm install --save-dev @babel/core @babel/cli @babel/preset-env
    ```
  - 补丁包
    ```
    npm install --save @babel/polyfill（不建议，官方建议用下面的依赖包）
    ```
    ```
    npm i --save core-js regenerator-runtime axios
    ```
- 依赖包介绍
  - `@babel/cli` 命令行代码，除了配合 `webpack`使用，还能使用命令行使用 : `./node_modules/.bin/babel test/test.js`
  - `@babel/core` 核心代码  
  - `@babel/preset-env` 智能预设环境，最新版的 `useBuiltIns` 参数可以按需加载的补丁包 [官网介绍](https://babeljs.io/docs/en/babel-preset-env#docsNav)。 
  - `@babel/polyfill` 模拟一个完整的ES2015+运行环境,多段填充代码，Babel 7.4.0已经不建议安装该依赖。`As of Babel 7.4.0, this package has been deprecated in favor of directly including core-js/stable (to polyfill ECMAScript features) and regenerator-runtime/runtime (needed to use transpiled generator functions)`，[官方介绍](https://babeljs.io/docs/en/babel-polyfill)
  - `axios` 网络请求包，`corejs`不包括该补丁包
- 创建`.babelrc`文件
  ```json
  // .babelrc
  {
    "presets": [
      [
        "@babel/preset-env",
        {
          "useBuiltIns": "usage", // 用到相关的polyfill将自动导入
          "corejs":"3",
          "targets": ["> 1%", "last 2 versions", "not ie <= 8", "Android > 3"]
        }
      ],
    ],
    "plugins": [
    ]
  }
  ```
  `Instead of adding all the plugins we want one by one, we can use a "preset" which is just a pre-determined set of plugins`
  

  注：
  1. `@babel/polyfill`与`@babel/plugin-transform-runtime`区别在于：`polyfill`会改写全局`prototype`，所以它使得可以使用实例方法如`Array.prototype.includes`,它将像原生原型一样添加到全局作用域，适用于单独的项目；但是`transform runtime`它不会污染全局的作用域，所以不能使用实例方法，适用于第三方开发产品。
  2. 使用`useBuiltIns`参数需要指定corejs的版本号，根据`package.json`里的`core-js`的版本号设置即可，不然会有warning：
   ```WARNING: We noticed you're using the `useBuiltIns` option without declaring a core-js version. Currently, we assume version 2.x when no version is passed. Since this default version will likely change in future versions of Babel, we recommend explicitly setting the core-js version you are using via the `corejs` option.```


- 改进一下，新创建`.browserslistrc`文件，将`.babelrc`里的target内容放到这个文件
  ```json
  // .babelrc
  {
    "presets": [
      [
        "@babel/preset-env",
        {
          "useBuiltIns": "usage", // 用到相关的polyfill将自动导入
          "corejs":"3.0.0",
        }
      ],
    ],
    "plugins": [
    ]
  }
  ```
  ```js
  // .browserslistrc
  > 1%
  last 2 versions
  not ie <= 8
  Android > 3
  ```


  ## 笔记
  - `babel`：转换语法；多段填充在你目标环境中确实的特性；源代码变换；
  - 使用`postcss-loader`需要配置`.postcssrc`或者`posetcss.config.js`，或者在webpack的rules里面的`postcss-loader`里面配置 `options`
  - `babel-loader`在运行时，会检查这个`.babelrc`配置文件，并读取相关的语法和插件配置，或者在webpack的rules里面的`babel-loader`里面配置 `options`
  - `autoprefixer`也是共用了`.browserslistrc`的配置
  - `yargs.argv`就是包装后的`process.argv`，前者返回的是一个对象包含了键值对，后者则是返回一个字符串数组
  - babel的`modules`设置为false，优化`tree-shaking`
  - `vue-router`路由懒加载
    ```
    new Router({
      routes: [
        {
          path: '/',
          component: resolve => require(['pages/index.vue'], resolve)
        },
      ]
    })
    ```
  - `optimization.runtimeChunk` 为每个入口提取出webpack `runtime`模块
    ```js
    // runtimeChunk设置single默认name为‘runtime’
    optimization: {
      runtimeChunk: 'single'
    }
    ...
    plugins:[
      new InlineManifestWebpackPlugin() // 将运行代码直接插入html文件中，因为这段代码非常少且时常改动，这样做可以避免一次请求的开销
    ]

    // 如果指定了其他名字则需要配套做修改
    runtimeChunk: { name: 'manifest' },
    ...
    new InlineManifestWebpackPlugin('manifest')
    ```
  - webpack4.0已经将`optimization.minimizer`的js打包替换成`TerserPlugin`，相比`UglifyJsPlugin`，TerserPlugin能支持es6+的语法，切具有`tree-shaking`作用，自动删除未使用片段
    ```js
    optimization: {
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true, // 开启并行压缩，充分利用cpu
          sourceMap: false,
          terserOptions: {
            compress: { drop_console: true },
          }
        }),
        new OptimizeCSSAssetsPlugin({}) // 优化\最小化CSS（默认情况下，它使用cssnano）
      ],
    }
    ```
  - `optimization.splitChunks`:从4.0版本开始`CommonsChunkPlugin`被移除且被`optimization.splitChunks`和`optimization.runtimeChunk`配置项代替
    ```js
    optimization: {
      runtimeChunk: { name: 'manifest' },
      // 采用splitChunks提取出entry chunk的chunk Group
      splitChunks: {
        automaticNameDelimiter: '~', // 指定生成名字中的分隔符
        name: true, // 分割块的名称，提供 true 会自动生成基于 chunk 和缓存组键的名称
        maxAsyncRequests: 5, // 按需加载时，并行请求的最大数量，默认是 5
        maxInitialRequests: 3, // 一个入口最大的并行请求数，默认是 3
        minChunks: 1, // 在分割之前，这个代码块最小应该被引用的次数，默认是 1
        minSize: 30000,  // 一个新的 chunk 的最小体积，默认是 30000，即 30K
        cacheGroups: {
          // 处理入口chunk
          vendors: {
            test: /[\\/]node_modules[\\/]/, // 创建一个vendor代码块,它包含了整个应用中所有来自node_modules的代码
            chunks: 'initial', // 初始化代码块，初始化的依赖包才抽出chunk，不会导致vendors包很大
            name: 'vendors', // 抽取公共代码的 chunk 名字
            priority: 1, // 处理优先级默认为0
            reuseExistingChunk: true,
          },
          // 处理异步chunk
          'async-vendors': {
            test: /[\\/]node_modules[\\/]/,
            minChunks: 3, //最少被几个chunk引用，默认为1, 防止打包太多文件
            chunks: 'async', // 按需加载代码块，建议不要全部代码都放在venders中，将异步加载的分开来，不然初始化代码会很大
            name: 'async-vendors',
            priority: 0,
            reuseExistingChunk: true,  // 如果该chunk中引用了已经被抽取的chunk，直接引用该chunk，不会重复打包代码
          },
        }
      }
    },
    ```
  - `mini-css-extract-plugin`：将CSS提取为独立的文件的插件，对每个包含css的js文件都会创建一个CSS文件，只能用在webpack4.0，相对于 `extract-text-webpack-plugin`的优点：
    1. 异步加载
    2. 不重复编译，性能更好
    3. 更容易使用
    4. 只针对CSS
    ```js
    plugins: [
      // 从js中提取css，目前缺失HMR，所以只能在生成环境中使用
      new MiniCssExtractPlugin({
        filename: assestPathName + `/css/[name].[contenthash:8].css`,
        chunkFilename: assestPathName + `/css/[id].[chunkhash:8].css`, 
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(le|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // 这里可以指定一个 publicPath
                // 默认使用 webpackOptions.output中的publicPath
                publicPath: ''
              },
            },
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
    ```
  - `html-webpack-plugin`：生成html文件，并在页面中动态插入静态文件和内容，`HashedModuleIdsPlugin`是保持id不变的，是一种长期缓存优化策略，需要放在`HtmlWebpackPlugin`下面定义
    ```js
    plugins: [
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
        chunks: ['manifest', 'vendors', 'app']
      }),
      // keep module.id stable when vendor modules does not change
      new webpack.HashedModuleIdsPlugin(),
    ]
    ```
  - ignore某些用不到的大资源，譬如moment里的locale相关文件，用分析工具会看到体积巨大，可以配置`new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)`
