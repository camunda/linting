# @camunda/linting

The BPMN linter used by the Camunda Desktop and Web Modeler. Batteries included. 🔋

# Features

* bundles [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat/)
* configures linter based on `modeler:executionPlatform` and `modeler:executionPlatformVersion`
* creates error messages to be shown in desktop and web modeler
* creates errors to be shown in properties panel
* creates error overlays to be shown on canvas 

# Usage

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
  modeler: 'web'
});

// lint by passing definitions
const reports = await linter.lint(definitions);

// or passing XML
const reports = await linter.lint(xml);

...

// update errors on canvas and in properties panel (requires bpmn-js-properties-panel >= 1.3.0)
modeler.get('linting').update(reports);
```

# License

MIT