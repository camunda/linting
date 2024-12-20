import BpmnModdle from 'bpmn-moddle';

import { Linter as BpmnLinter } from 'bpmnlint';
import StaticResolver from 'bpmnlint/lib/resolver/static-resolver';

import Resolver from './Resolver';

import { isString } from 'min-dash';

import { resolver as RulesResolver } from './compiled-config';

import modelerModdle from 'modeler-moddle/resources/modeler.json';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';
import camundaModdle from 'camunda-bpmn-moddle/resources/camunda.json';

import { getErrorMessage } from './utils/error-messages';
import { getEntryIds } from './utils/properties-panel';

import { toSemverMinor } from './utils/version';

import defaultPlugins from './plugins';

const NoopResolver = new StaticResolver({});

/**
 * @param {Object} [options]
 * @param {string} [options.modeler='desktop']
 * @param {Array<Object>} [options.plugins=[]]
 * @param {string} [options.type='cloud']
 */
export class Linter {
  constructor(options = {}) {
    const {
      modeler = 'desktop',
      plugins = [],
      type = 'cloud'
    } = options;

    this._moddle = new BpmnModdle({
      modeler: modelerModdle,

      // Zeebe and Camunda moddle extensions can't be used together
      // cf. https://github.com/camunda/camunda-modeler/issues/3853#issuecomment-1731145100
      ...(type === 'cloud' ?
        { zeebe: zeebeModdle } :
        { camunda: camundaModdle })
    });

    this._modeler = modeler;
    this._plugins = [ ...defaultPlugins, ...plugins ];
  }

  async lint(contents) {
    let rootElement;

    if (isString(contents)) {
      ({ rootElement } = await this._moddle.fromXML(contents));
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
            executionPlatform,
            executionPlatformVersion,
            message: getErrorMessage(
              report,
              executionPlatform,
              executionPlatformVersion,
              this._modeler
            ),
            propertiesPanel: {
              entryIds
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
      ...this._plugins.map(({ config = {} }) => config)
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
    const { configs } = await import('bpmnlint-plugin-camunda-compat');

    let { [ configName ]: config } = configs;

    if (!config) {
      config = {
        rules: {}
      };
    }

    config.rules = addConfig(config.rules, {
      modeler: this._modeler
    });

    const ConfigResolver = new StaticResolver({
      [ `config:bpmnlint-plugin-camunda-compat/${ configName }` ]: config
    });

    return new Resolver([
      ConfigResolver,
      RulesResolver,
      ...this._plugins.map(({ resolver = NoopResolver }) => resolver)
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

function addConfig(rules, configToAdd) {
  let rulesWithConfig = {};

  for (let name in rules) {
    let type, config;

    if (Array.isArray(rules[ name ])) {
      type = rules[ name ][0];
      config = rules[ name ][1] || {};
    } else {
      type = rules[ name ];
      config = {};
    }

    rulesWithConfig[ name ] = [ type, { ...config, ...configToAdd } ];
  }

  return rulesWithConfig;
}