import bpmnIoPlugin from 'eslint-plugin-bpmn-io';

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
  ...bpmnIoPlugin.configs.node.map(config => ({
    ...config,
    files: files.build
  })),
  {
    files: files.build,
    languageOptions: {
      sourceType: 'commonjs'
    }
  },

  // mocha config scoped to test files only
  ...bpmnIoPlugin.configs.mocha.map(config => ({
    ...config,
    files: files.test
  })),

  // test files: webpack provides `require`
  {
    files: files.test,
    languageOptions: {
      globals: {
        require: 'readonly'
      }
    }
  }
];
