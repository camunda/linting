import bpmnIoPlugin from 'eslint-plugin-bpmn-io';
import globals from 'globals';

const files = {
  ignored: [
    'node_modules',
    'lib/compiled-config.js'
  ],
  build: [
    'karma.conf.js',
    'tasks/**/*.js'
  ],
  test: [
    'test/**/*.js'
  ]
};

export default [
  {
    ignores: files.ignored
  },
  ...bpmnIoPlugin.configs.browser,

  // node/CJS globals for build tooling
  {
    files: files.build,
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: 'commonjs'
    }
  },

  // mocha config scoped to test files only
  ...bpmnIoPlugin.configs.mocha.map(config => ({
    ...config,
    files: files.test
  })),

  // test files: webpack provides `require`; turn off rules not previously enforced
  {
    files: files.test,
    languageOptions: {
      globals: {
        require: 'readonly'
      }
    },
    rules: {
      'mocha/no-async-suite': 'off',
      'mocha/no-identical-title': 'off'
    }
  }
];
