#!/usr/bin/env node

/* eslint-env node */

const fs = require('fs');

const {
  green,
  red
} = require('ansi-colors');

const { Linter } = require('../dist/Linter.js');

const linter = new Linter();

const files = process.argv.filter(arg => arg.endsWith('.bpmn'));

if (files.length === 0) {
  console.error('No files found');

  process.exit(1);
}

console.log(`Linting ${files.length} file(s)`);

let errors = 0;

files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    linter.lint(content).then((results) => {
      if (!results.length) {
        console.log(green(file));

        return;
      }

      errors += results.length;

      console.log(red(file));

      results.forEach((result) => {
        console.log(red(`\t[${result.id}] ${result.message}`));
      });
    });

  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
});

process.on('exit', () => {
  if (errors) {
    process.exit(1);
  }
});