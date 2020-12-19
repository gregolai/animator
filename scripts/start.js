'use strict';

process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');


const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');

const config = configFactory('development');

const compiler = webpack(config);

const devServer = new WebpackDevServer(compiler, {
  // clientLogLevel: 'none',
  compress: true,
  contentBase: paths.appPublic,
  disableHostCheck: true,
  historyApiFallback: true,
  hot: true,
  overlay: true,
  stats: {
    assets: false,
    chunkModules: false,
    chunks: false,
    colors: true,
    hash: false,
    modules: false,
    timings: false,
    version: false
  },
  publicPath: '/',
  // quiet: true
  watchContentBase: true
});
// Launch WebpackDevServer.
devServer.listen(3000, 'localhost', err => {
  if (err) {
    return console.log(err);
  }
  clearConsole();
  console.log(chalk.cyan('Starting the development server...\n'));
});

['SIGINT', 'SIGTERM'].forEach(function(sig) {
  process.on(sig, function() {
    devServer.close();
    process.exit();
  });
});
