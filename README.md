# @camunda/linting

The BPMN linter used by the Camunda Desktop and Web Modeler. Batteries included. 🔋

# Features

* bundles [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat/)
* configures linter based on `modeler:executionPlatform` and `modeler:executionPlatformVersion`
* creates error messages to be shown in desktop and web modeler
* creates errors to be shown in properties panel

# Usage

```javascript
import { Linter } from '@camunda/linting';
import { getErrors } from '@camunda/linting/properties-panel';

...

// lint by passing definitions
const reports = await Linter.lint(definitions);

// or passing XML
const reports = await Linter.lint(xml);

...

const errors = getErrors(reports, element);

// bpmn-js-properties-panel >=1.3.0
eventBus.fire('propertiesPanel.setErrors', { errors });
```

# License

MIT