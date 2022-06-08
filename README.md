# @camunda/linting

The BPMN linter used by the Camunda Desktop and Web Modeler. Batteries included. 🔋

# Features

* bundles [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat/)
* configures linter based on `modeler:executionPlatform` and `modeler:executionPlatformVersion`
* adjusts error messages to be shown in desktop and web modeler

# Usage

```javascript
import { Linter } from '@camunda/linting';

...

// lint by passing definitions
const reports = await Linter.lint(definitions);

// or passing XML
const reports = await Linter.lint(xml);
```

# License

MIT