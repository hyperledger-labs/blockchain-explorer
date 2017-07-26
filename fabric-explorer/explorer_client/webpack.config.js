var path = require('path');
var webpack = require('webpack');


module.exports = {
  entry: ["webpack/hot/dev-server", "./js/index.js"],
  output: {
    path: path.join(__dirname, 'js'),
    filename: "index-gen.js",
    publicPath: '/js/'
  },
  watchOptions: {
	  aggregateTimeout: 300,
	  poll: 1000
  },
  devServer: {
	  historyApiFallback: true,
	  hot: true,
	  inline: true,
	  stats: 'errors-only',
	  port: 8081
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
      d3: "d3",
      Backbone: "backbone",
      _: "underscore",
      SockJS: "sockjs-client",
      moment: "moment",
    }),
    new webpack.HotModuleReplacementPlugin({
    	multiStep: true
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "js"),
          path.resolve(__dirname, "node_modules/jif-dashboard"),
        ],
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: [
            'transform-promise-to-bluebird',
            'transform-runtime'
          ],
        }
      }
    ]
  }
};
