/* eslint-env node */

const fs = require('fs');

const compileConfig = require('bpmnlint/lib/support/compile-config');

const config = {
  extends: 'plugin:camunda-compat/all'
};

compileConfig(config).then(code => fs.writeFileSync('lib/compiled-config.js', code));