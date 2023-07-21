/* eslint-env node */

'use strict';

// configures browsers to run test against
// any of [ 'ChromeHeadless', 'Chrome', 'Firefox', 'IE', 'PhantomJS' ]
var browsers = (process.env.TEST_BROWSERS || 'ChromeHeadless').split(',');

var singleStart = process.env.SINGLE_START;

// use puppeteer provided Chrome for testing
process.env.CHROME_BIN = require('puppeteer').executablePath();

var path = require('path');

var absoluteBasePath = path.resolve(__dirname);

var suite = 'test/suite.js';


module.exports = function(karma) {

  karma.set({

    plugins: [
      'karma-*'
    ],

    frameworks: [
      'mocha',
      'sinon-chai',
      'webpack'
    ],

    files: [
      { pattern: 'assets/**/*', included: false, served: true },
      suite
    ],

    preprocessors: {
      [suite]: [ 'webpack', 'env' ]
    },

    reporters: [ 'progress' ],

    browsers: singleStart ? browsers.concat('Debug') : browsers,

    browserNoActivityTimeout: 30000,

    envPreprocessor: singleStart ? [ 'SINGLE_START' ] : [],

    autoWatch: false,
    singleRun: true,

    webpack: {
      mode: 'development',
      devtool: 'eval-source-map',
      module: {
        rules: [
          {
            test: /\.(css|bpmn)$/,
            type: 'asset/source'
          }
        ]
      },
      resolve: {
        mainFields: [
          'dev:module',
          'browser',
          'module',
          'main'
        ],
        modules: [
          'node_modules',
          absoluteBasePath
        ]
      }
    }
  });
};