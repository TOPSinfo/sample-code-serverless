const path = require('path');
const slsw = require('serverless-webpack');
// const WebpackPluginCopy = require("inq-webpack-plugin-copy");
module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        loaders: ['babel-loader'],
        include: __dirname,
        exclude: /node_modules/,
      },
      // {
      //   test: /\.json$/,
      //   loaders: ['json-loader']
      // },
      {
        test: /\.node$/,
        loaders: ['node-loader'],
      },
      {
        test: /\.pem$/i,
        loaders: ['raw-loader'],
      }
    ]
  },
  externals: [
    (function () {
      var IGNORES = [
        'electron', 'pg-native'
      ];
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, "require('" + request + "')");
        }
        return callback();
      };
    })()
  ]
};
