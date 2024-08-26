
const cache = {};

/**
 * A resolver that caches rules and configuration as part of the bundle,
 * making them accessible in the browser.
 *
 * @param {Object} cache
 */
function Resolver() {}

Resolver.prototype.resolveRule = function(pkg, ruleName) {

  const rule = cache[pkg + '/' + ruleName];

  if (!rule) {
    throw new Error('cannot resolve rule <' + pkg + '/' + ruleName + '>: not bundled');
  }

  return rule;
};

Resolver.prototype.resolveConfig = function(pkg, configName) {
  throw new Error(
    'cannot resolve config <' + configName + '> in <' + pkg +'>: not bundled'
  );
};

const resolver = new Resolver();

const rules = {
  "camunda-compat/element-type": "error",
  "camunda-compat/called-element": "error",
  "camunda-compat/collapsed-subprocess": "error",
  "camunda-compat/connector-properties": "warn",
  "camunda-compat/duplicate-execution-listeners": "error",
  "camunda-compat/duplicate-task-headers": "error",
  "camunda-compat/error-reference": "error",
  "camunda-compat/escalation-boundary-event-attached-to-ref": "error",
  "camunda-compat/escalation-reference": "error",
  "camunda-compat/event-based-gateway-target": "error",
  "camunda-compat/executable-process": "error",
  "camunda-compat/execution-listener": "error",
  "camunda-compat/feel": "error",
  "camunda-compat/history-time-to-live": "info",
  "camunda-compat/implementation": "error",
  "camunda-compat/inclusive-gateway": "error",
  "camunda-compat/link-event": "error",
  "camunda-compat/loop-characteristics": "error",
  "camunda-compat/message-reference": "error",
  "camunda-compat/no-binding-type": "error",
  "camunda-compat/no-candidate-users": "error",
  "camunda-compat/no-execution-listeners": "error",
  "camunda-compat/no-expression": "error",
  "camunda-compat/no-loop": "error",
  "camunda-compat/no-multiple-none-start-events": "error",
  "camunda-compat/no-priority-definition": "error",
  "camunda-compat/no-propagate-all-parent-variables": "error",
  "camunda-compat/no-signal-event-sub-process": "error",
  "camunda-compat/no-task-schedule": "error",
  "camunda-compat/no-template": "error",
  "camunda-compat/no-version-tag": "error",
  "camunda-compat/no-zeebe-properties": "error",
  "camunda-compat/no-zeebe-user-task": "error",
  "camunda-compat/priority-definition": "error",
  "camunda-compat/secrets": "warn",
  "camunda-compat/sequence-flow-condition": "error",
  "camunda-compat/signal-reference": "error",
  "camunda-compat/start-event-form": "error",
  "camunda-compat/subscription": "error",
  "camunda-compat/task-schedule": "error",
  "camunda-compat/timer": "error",
  "camunda-compat/user-task-definition": "warn",
  "camunda-compat/user-task-form": "error",
  "camunda-compat/wait-for-completion": "error"
};

const config = {
  rules: rules
};

const bundle = {
  resolver: resolver,
  config: config
};

export { resolver, config };

export default bundle;

import rule_0 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/element-type';

cache['bpmnlint-plugin-camunda-compat/element-type'] = rule_0;

import rule_1 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/called-element';

cache['bpmnlint-plugin-camunda-compat/called-element'] = rule_1;

import rule_2 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/collapsed-subprocess';

cache['bpmnlint-plugin-camunda-compat/collapsed-subprocess'] = rule_2;

import rule_3 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/connector-properties';

cache['bpmnlint-plugin-camunda-compat/connector-properties'] = rule_3;

import rule_4 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/duplicate-execution-listeners';

cache['bpmnlint-plugin-camunda-compat/duplicate-execution-listeners'] = rule_4;

import rule_5 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/duplicate-task-headers';

cache['bpmnlint-plugin-camunda-compat/duplicate-task-headers'] = rule_5;

import rule_6 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/error-reference';

cache['bpmnlint-plugin-camunda-compat/error-reference'] = rule_6;

import rule_7 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/escalation-boundary-event-attached-to-ref';

cache['bpmnlint-plugin-camunda-compat/escalation-boundary-event-attached-to-ref'] = rule_7;

import rule_8 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/escalation-reference';

cache['bpmnlint-plugin-camunda-compat/escalation-reference'] = rule_8;

import rule_9 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/event-based-gateway-target';

cache['bpmnlint-plugin-camunda-compat/event-based-gateway-target'] = rule_9;

import rule_10 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/executable-process';

cache['bpmnlint-plugin-camunda-compat/executable-process'] = rule_10;

import rule_11 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/execution-listener';

cache['bpmnlint-plugin-camunda-compat/execution-listener'] = rule_11;

import rule_12 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/feel';

cache['bpmnlint-plugin-camunda-compat/feel'] = rule_12;

import rule_13 from 'bpmnlint-plugin-camunda-compat/rules/camunda-platform/history-time-to-live';

cache['bpmnlint-plugin-camunda-compat/history-time-to-live'] = rule_13;

import rule_14 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation';

cache['bpmnlint-plugin-camunda-compat/implementation'] = rule_14;

import rule_15 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/inclusive-gateway';

cache['bpmnlint-plugin-camunda-compat/inclusive-gateway'] = rule_15;

import rule_16 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/link-event';

cache['bpmnlint-plugin-camunda-compat/link-event'] = rule_16;

import rule_17 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/loop-characteristics';

cache['bpmnlint-plugin-camunda-compat/loop-characteristics'] = rule_17;

import rule_18 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/message-reference';

cache['bpmnlint-plugin-camunda-compat/message-reference'] = rule_18;

import rule_19 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-binding-type';

cache['bpmnlint-plugin-camunda-compat/no-binding-type'] = rule_19;

import rule_20 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-candidate-users';

cache['bpmnlint-plugin-camunda-compat/no-candidate-users'] = rule_20;

import rule_21 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-execution-listeners';

cache['bpmnlint-plugin-camunda-compat/no-execution-listeners'] = rule_21;

import rule_22 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-expression';

cache['bpmnlint-plugin-camunda-compat/no-expression'] = rule_22;

import rule_23 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-loop';

cache['bpmnlint-plugin-camunda-compat/no-loop'] = rule_23;

import rule_24 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-multiple-none-start-events';

cache['bpmnlint-plugin-camunda-compat/no-multiple-none-start-events'] = rule_24;

import rule_25 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-priority-definition';

cache['bpmnlint-plugin-camunda-compat/no-priority-definition'] = rule_25;

import rule_26 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-propagate-all-parent-variables';

cache['bpmnlint-plugin-camunda-compat/no-propagate-all-parent-variables'] = rule_26;

import rule_27 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-signal-event-sub-process';

cache['bpmnlint-plugin-camunda-compat/no-signal-event-sub-process'] = rule_27;

import rule_28 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-task-schedule';

cache['bpmnlint-plugin-camunda-compat/no-task-schedule'] = rule_28;

import rule_29 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-template';

cache['bpmnlint-plugin-camunda-compat/no-template'] = rule_29;

import rule_30 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-version-tag';

cache['bpmnlint-plugin-camunda-compat/no-version-tag'] = rule_30;

import rule_31 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-zeebe-properties';

cache['bpmnlint-plugin-camunda-compat/no-zeebe-properties'] = rule_31;

import rule_32 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-zeebe-user-task';

cache['bpmnlint-plugin-camunda-compat/no-zeebe-user-task'] = rule_32;

import rule_33 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/priority-definition';

cache['bpmnlint-plugin-camunda-compat/priority-definition'] = rule_33;

import rule_34 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/secrets';

cache['bpmnlint-plugin-camunda-compat/secrets'] = rule_34;

import rule_35 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/sequence-flow-condition';

cache['bpmnlint-plugin-camunda-compat/sequence-flow-condition'] = rule_35;

import rule_36 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/signal-reference';

cache['bpmnlint-plugin-camunda-compat/signal-reference'] = rule_36;

import rule_37 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/start-event-form';

cache['bpmnlint-plugin-camunda-compat/start-event-form'] = rule_37;

import rule_38 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/subscription';

cache['bpmnlint-plugin-camunda-compat/subscription'] = rule_38;

import rule_39 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/task-schedule';

cache['bpmnlint-plugin-camunda-compat/task-schedule'] = rule_39;

import rule_40 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer';

cache['bpmnlint-plugin-camunda-compat/timer'] = rule_40;

import rule_41 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/user-task-definition';

cache['bpmnlint-plugin-camunda-compat/user-task-definition'] = rule_41;

import rule_42 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/user-task-form';

cache['bpmnlint-plugin-camunda-compat/user-task-form'] = rule_42;

import rule_43 from 'bpmnlint-plugin-camunda-compat/rules/camunda-cloud/wait-for-completion';

cache['bpmnlint-plugin-camunda-compat/wait-for-completion'] = rule_43;