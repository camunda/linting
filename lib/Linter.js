import BpmnModdle from 'bpmn-moddle/dist/index';

import { Linter as BpmnLinter } from 'bpmnlint';

import StaticResolver from 'bpmnlint/lib/resolver/static-resolver';

import { configs } from 'bpmnlint-plugin-camunda-compat';

import { isString } from 'min-dash';

import modelerModdle from 'modeler-moddle/resources/modeler.json';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';

import { getErrorMessage } from './utils/error-messages';
import { getEntryIds } from './utils/properties-panel';

const moddle = new BpmnModdle({
  modeler: modelerModdle,
  zeebe: zeebeModdle
});

export class Linter {
  constructor(options = {}) {
    const { modeler = 'desktop' } = options;

    this._modeler = modeler;
  }

  async lint(contents) {
    let rootElement;

    if (isString(contents)) {
      ({ rootElement } = await moddle.fromXML(contents));
    } else {
      rootElement = contents;
    }

    const executionPlatform = rootElement.get('modeler:executionPlatform'),
          executionPlatformVersion = rootElement.get('modeler:executionPlatformVersion');

    if (!executionPlatform || !executionPlatformVersion) {
      return [];
    }

    const configName = getConfigName(executionPlatform, executionPlatformVersion);

    const config = configs[ configName ];

    if (!config) {
      return [];
    }

    const rules = await importRules(config);

    const linter = new BpmnLinter({
      config: prefixRules(config),
      resolver: new StaticResolver(rules)
    });

    const allReports = await linter.lint(rootElement);

    return Object.values(allReports).reduce((allReports, reports) => {
      return [
        ...allReports,
        ...reports.map(report => {
          const entryIds = getEntryIds(report);

          return {
            ...report,
            message: getErrorMessage(
              report,
              getExecutionPlatformLabel(executionPlatform, toSemverMinor(executionPlatformVersion)),
              this._modeler
            ),
            propertiesPanel: {
              entryId: entryIds[ Math.max(0, entryIds.length - 1) ]
            }
          };
        })
      ];
    }, []);
  }
}

function getConfigName(executionPlatform, executionPlatformVersion) {
  return [
    ...executionPlatform.split(' ').map(toLowerCase),
    ...toSemverMinor(executionPlatformVersion).split('.')
  ].join('-');
}

function prefixRules({ rules }) {
  return {
    rules: Object.entries(rules).reduce((rules, [ key, value ]) => {
      return {
        ...rules,
        [ `bpmnlint-plugin-camunda-compat/${ key }` ]: value
      };
    }, {})
  };
}

async function importRules({ rules }) {
  let importedRules = {};

  for (let key of Object.keys(rules)) {
    const importedRule = require(`bpmnlint-plugin-camunda-compat/rules/${ key }`);

    importedRules = {
      ...importedRules,
      [ `rule:bpmnlint-plugin-camunda-compat/${ key }` ]: importedRule
    };
  }

  return importedRules;
}

const executionPlatformLabels = {
  'Camunda Cloud': {
    '1.0': 'Camunda 8 (Zeebe 1.0)',
    '1.1': 'Camunda 8 (Zeebe 1.1)',
    '1.2': 'Camunda 8 (Zeebe 1.2)',
    '1.3': 'Camunda 8 (Zeebe 1.3)',
    '8.0': 'Camunda 8'
  }
};

function getExecutionPlatformLabel(executionPlatform, executionPlatformVersion) {
  return executionPlatformLabels[ executionPlatform ] && executionPlatformLabels[ executionPlatform ][ executionPlatformVersion ];
}

function toLowerCase(string) {
  return string.toLowerCase();
}

function toSemverMinor(executionPlatformVersion) {
  return executionPlatformVersion.split('.').slice(0, 2).join('.');
}