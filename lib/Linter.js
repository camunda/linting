import BpmnModdle from 'bpmn-moddle';

import { Linter as BpmnLinter } from 'bpmnlint';
import StaticResolver from 'bpmnlint/lib/resolver/static-resolver';

import Resolver from './Resolver';

import { isString } from 'min-dash';

import modelerModdle from 'modeler-moddle/resources/modeler.json';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';

import { getErrorMessage } from './utils/error-messages';
import { getEntryIds } from './utils/properties-panel';

import { toSemverMinor } from './utils/version';

const moddle = new BpmnModdle({
  modeler: modelerModdle,
  zeebe: zeebeModdle
});

export class Linter {
  constructor(options = {}) {
    const {
      modeler = 'desktop',
      plugins = []
    } = options;

    this._modeler = modeler;
    this._plugins = plugins;
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

    const config = this._createConfig(configName);

    const resolver = await this._createResolver(configName);

    const linter = new BpmnLinter({
      config,
      resolver
    });

    const reportsByRule = await linter.lint(rootElement);

    return Object.entries(reportsByRule).reduce((allReports, entry) => {
      const [ rule, reports ] = entry;

      return [
        ...allReports,
        ...reports.map(report => {
          const entryIds = getEntryIds(report);

          return {
            ...report,
            message: getErrorMessage(
              report,
              executionPlatform,
              executionPlatformVersion,
              this._modeler
            ),
            propertiesPanel: {
              entryId: entryIds[ Math.max(0, entryIds.length - 1) ]
            },
            rule
          };
        })
      ];
    }, []);
  }

  _createConfig(configName) {
    const configs = [
      {
        extends: `plugin:bpmnlint-plugin-camunda-compat/${ configName }`
      },
      ...this._plugins.map(({ config }) => config)
    ];

    return configs.reduce(
      (config, _config) => {
        let { extends: _extends = [], rules = {} } = _config;

        if (isString(_extends)) {
          _extends = [ _extends ];
        }

        return {
          extends: [ ...config.extends, ..._extends ],
          rules: {
            ...config.rules,
            ...rules
          }
        };
      },
      {
        extends: [],
        rules: {}
      }
    );
  }

  async _createResolver(configName) {
    const cache = await createCache(configName);

    return new Resolver([
      new StaticResolver(cache),
      ...this._plugins.map(({ resolver }) => resolver)
    ]);
  }
}

function getConfigName(executionPlatform, executionPlatformVersion) {
  return [
    ...executionPlatform.split(' ').map(toLowerCase),
    ...toSemverMinor(executionPlatformVersion).split('.')
  ].join('-');
}

function toLowerCase(string) {
  return string.toLowerCase();
}

async function createCache(configName) {
  let config = require('bpmnlint-plugin-camunda-compat').configs[ configName ];

  if (!config) {
    config = {
      rules: {}
    };
  }

  const rules = await requireRules(config);

  return {
    [ `config:bpmnlint-plugin-camunda-compat/${ configName }` ]: config,
    ...rules
  };
}

function requireRules({ rules }) {
  let requiredRules = {};

  for (let ruleName of Object.keys(rules)) {
    const requiredRule = require(`bpmnlint-plugin-camunda-compat/rules/${ ruleName }`);

    requiredRules = {
      ...requiredRules,
      [ `rule:bpmnlint-plugin-camunda-compat/${ ruleName }` ]: requiredRule
    };
  }

  return requiredRules;
}