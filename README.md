# @camunda/linting

[![CI](https://github.com/camunda/linting/actions/workflows/CI.yml/badge.svg)](https://github.com/camunda/linting/actions/workflows/CI.yml)

The BPMN linter used by the Camunda Desktop and Web Modeler. Batteries included. 🔋

## Features

* bundles [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat/)
* configures linter based on `modeler:executionPlatform` and `modeler:executionPlatformVersion`
* creates error messages to be shown in desktop and web modeler
* creates errors to be shown in properties panel
* creates error overlays to be shown on canvas 

## Usage

```javascript
import Modeler from 'bpmn-js/lib/Modeler';

import { Linter } from '@camunda/linting';

import lintingModule from '@camunda/linting/modeler';

import '@camunda/linting/assets/linting.css';

const modeler = new Modeler({
  additionalModules: [
    lintingModule
  ]
});

// configure to be used with desktop or web modeler
const linter = new Linter({
  modeler: 'web', // `desktop` or `web` modeler, defaults to `desktop`
  type: 'cloud' // `cloud` or `platform` diagrams, defaults to `cloud`
});

// lint by passing definitions
const reports = await linter.lint(definitions);

// or passing XML
const reports = await linter.lint(xml);

...

// update errors on canvas and in properties panel (requires bpmn-js-properties-panel >= 1.3.0)
modeler.get('linting').setErrors(reports);

// show error by selecting element and properties panel entry
modeler.get('linting').showError(report);

// activate and deactivate errors on canvas
modeler.get('linting').activate();
modeler.get('linting').deactivate();
```

## Development

```sh
# install
npm i

# run tests
npm t

# run tests in watch mode
npm run test:watch

# run example
npm start
```

## License

MIT
