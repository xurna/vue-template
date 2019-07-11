# vue-test
vue function base 尝试

## 笔记
- babel：转换语法；多段填充在你目标环境中确实的特性；源代码变换；



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










  ### 笔记
  - 使用postcss-loader需要配置.postcssrc或者posetcss.config.js，或者在webpack的rules里面的postcss-loader里面配置
  - autoprefixer也是共用了.browserslistrc的配置
  - yargs.argv就是包装后的process.argv，前者返回的是一个对象包含了键值对，后者则是返回一个字符串数组
  - babel的modules设置为false，css modules------
  - vue-router路由懒加载
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
    - 