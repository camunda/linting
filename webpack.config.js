/* eslint-env node */

const path = require('path');

module.exports = {
  entry: './lib/Linter.js',
  output: {
    filename: 'Linter.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  target: 'node'
};