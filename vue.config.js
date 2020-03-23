// 导入compression-webpack-plugin
// const CompressionWebpackPlugin = require('compression-webpack-plugin')
// 定义压缩文件类型
// const productionGzipExtensions = ['js', 'css']

module.exports = {
  publicPath:
    process.env.NODE_ENV === "production"
      ? ""
      : "/",
  css: {
    sourceMap: false,
    // modules: true,
    requireModuleExtension: true,
    loaderOptions:
      process.env.NODE_ENV === "development"
        ? {}
        : {
            css: {
              // localIdentName: '[hash:10]',
              modules: {
                localIdentName: "[hash:7]"
              },
              localsConvention: "camelCaseOnly"
            }
          },
    extract: false //强制内联css
    // process.env.NODE_ENV === 'development' ? false : {
    //     extract: {
    //         filename: 'css/[contenthash:10].css',
    //         chunkFilename: 'css/[contenthash:10].css'
    //     }
    // },
  },
  productionSourceMap: false,
  // configureWebpack: {
  //     plugins: [
  //         new CompressionWebpackPlugin({
  //             filename: '[path].gz[query]',
  //             algorithm: 'gzip',
  //             test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
  //             threshold: 10240,
  //             minRatio: 0.8
  //         })
  //     ]
  // },
  indexPath: "index.html",
  // outputDir: 'test',
  // assetsDir:'',
  // runtimeCompiler: false, // set to true can use template in component
  // crossorigin: '',
  // integrity: true,
  chainWebpack: config => {
    if (process.env.NODE_ENV === "production") {
      config.output
        .filename("js/[contenthash:16].js")
        .chunkFilename("js/[contenthash:16].js")
        .end();
      config.plugins.delete("prefetch");
      config.optimization.minimizer("terser").tap(args => {
        args[0].terserOptions.compress.drop_console = true;
        return args;
      });
      // config.optimization.delete('splitChunks')
      // config.module.rule('images').test(/\.(png|jpe?g|gif)(\?.*)?$/).use('url-loader').loader('url-loader').tap(options => {
      // options.limit= 1240,
      // options.name= '[contenthash:8].ext'
      // return options
      // })
    }
  },
  devServer: {
    // host: "192.168.3.2",
    // port: 8080
    // cssSourceMkp: false,
    // assetsPublicPath: '/',
    // assetsSubDirectory: 'static',
    // env: require('./dev.env'),
    //     proxy: {
    //         '/api': {
    //             target: 'http://你的域名/'
    //         }
    //     }
  }
};
