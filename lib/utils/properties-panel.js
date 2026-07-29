import {
  isArray,
  isString
} from 'min-dash';

import { is } from 'bpmnlint-utils';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

import { greaterOrEqual } from './version';

const TIMER_PROPERTIES = [
  'timeDate',
  'timeDuration',
  'timeCycle'
];

const INVALID_VARIABLE_NAME_ERROR = 'Must be a valid variable name.';

/**
 * Get errors for a given element.
 *
 * @param {Object[]} reports
 * @param {Object} element
 * @param {(element: Object, path: Array<string|number>) => (string|null)} [resolveEntryId]
 *   render-time resolver (e.g. `propertiesPanel.getEntryId`) that maps a
 *   report's moddle `path` to the entry id the panel actually renders; takes
 *   precedence over the statically derived ids so template-bound fields resolve
 *   to their `custom-entry-*` entry
 *
 * @returns {Object}
 */
export function getErrors(reports, element, resolveEntryId) {
  return reports.reduce((errors, report) => {
    const { category } = report;

    if (!element
      || !isReportForElement(report, element)
      || category !== 'error') {
      return errors;
    }

    const ids = getReportEntryIds(report, element, resolveEntryId);

    if (!ids.length) {
      return errors;
    }

    // The message text depends on the *finding*, not on how it is rendered.
    // Derive it from the report's render-agnostic logical id (the static
    // classifier) rather than from the resolved render address, so a
    // template-bound field (`custom-entry-*`) shows the same corrected message
    // as the standard field. Falls back to the raw report message.
    const [ logicalId ] = getEntryIds(report);

    const message = getErrorMessage(logicalId, report) || report.message;

    return {
      ...errors,
      ...ids.reduce((errors, id) => {
        return {
          ...errors,
          [ id ]: message
        };
      }, {})
    };
  }, {});
}

/**
 * Check whether a report targets the given element, directly or via its
 * process (when the element is a participant showing that process).
 *
 * @param {Object} report
 * @param {Object} element
 *
 * @returns {boolean}
 */
function isReportForElement(report, element) {
  const businessObject = getBusinessObject(element);

  if (businessObject.get('id') === report.id) {
    return true;
  }

  const processRef = is(businessObject, 'bpmn:Participant')
    && businessObject.get('processRef');

  return processRef && processRef.get('id') === report.id;
}

/**
 * Resolve a report to the entry ids the properties panel renders for it.
 *
 * Shared by both the panel error listing (`getErrors`) and the "show entry"
 * navigation (`Linting#showError`) so a report always resolves to the same
 * ids regardless of the call site.
 *
 * Semantics: a report carries one or more moddle *leaf paths* (`report.paths`,
 * or the single `report.path`). Each leaf path points to exactly one offending
 * moddle location, which maps 1:1 to a single rendered entry. The render-time
 * `resolveEntryId` (backed by the `propertiesPanel.getEntryId` event) is
 * therefore single-valued — it answers with the one entry rendering that
 * location (a template field vs. a standard field), or defers.
 *
 * Findings that span *several* sibling locations (e.g. duplicate task-header
 * keys, a disallowed `zeebe:Properties` collection) emit one leaf path per
 * offending location in `report.paths`. This resolver maps each 1:1 and collects
 * the ids. Resolution is all-or-nothing: if any location can't be resolved via
 * the event, we fall back to the static `getEntryIds` fan-out for the whole
 * report (e.g. when no live provider listens, as in linting's own tests).
 *
 * @param {Object} report
 * @param {Object} element
 * @param {(element: Object, path: Array<string|number>) => (string|null)} [resolveEntryId]
 *
 * @returns {string[]}
 */
export function getReportEntryIds(report, element, resolveEntryId) {
  const paths = getReportPaths(report);

  if (resolveEntryId && element && paths.length) {
    const ids = [];

    for (const path of paths) {
      const id = resolveEntryId(element, path);

      // all-or-nothing: a single unresolved location falls back to the fan-out
      if (!id) {
        return getEntryIds(report);
      }

      ids.push(id);
    }

    return ids;
  }

  return getEntryIds(report);
}

/**
 * The leaf moddle paths a report highlights: `report.paths` (multi-field) or the
 * single `report.path`, normalized to a `Array<Array<string|number>>`.
 *
 * @param {Object} report
 *
 * @returns {Array<Array<string|number>>}
 */
function getReportPaths(report) {
  const { path, paths } = report;

  if (isArray(paths) && paths.length) {
    return paths.filter(path => isArray(path) && path.length);
  }

  if (isArray(path) && path.length) {
    return [ path ];
  }

  return [];
}

export function getEntryIds(report, prefixId) {
  const {
    data = {},
    path,
    propertiesPanel = {}
  } = report;

  if (propertiesPanel.entryIds) {
    return propertiesPanel.entryIds;
  }

  // id used as entry-id prefix; resolved by the caller to the displayed
  // element (the participant id for an expanded participant)
  const id = prefixId || report.id;

  if (isPropertyError(data, 'isExecutable')) {
    return [ 'isExecutable' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:CalledDecision', 'bpmn:BusinessRuleTask')) {
    return [ 'businessRuleImplementation' ];
  }

  // script task
  if (isExtensionElementRequiredError(data, 'zeebe:Script', 'bpmn:ScriptTask')) {
    return [ 'scriptImplementation' ];
  }

  if (isPropertyError(data, 'errorRef')) {
    return [ 'errorRef' ];
  }

  if (isPropertyError(data, 'escalationRef')) {
    return [ 'escalationRef' ];
  }

  if (isPropertyError(data, 'messageRef')) {
    return [ 'messageRef' ];
  }

  if (isPropertyError(data, 'signalRef')) {
    return [ 'signalRef' ];
  }

  if (isPropertyError(data, 'historyTimeToLive')) {
    return [ 'historyTimeToLive' ];
  }

  if (isPropertyError(data, 'decisionId', 'zeebe:CalledDecision')) {
    return [ 'decisionId' ];
  }

  if (isPropertyError(data, 'resultVariable')) {
    return [ 'resultVariable' ];
  }

  if (isPropertyError(data, 'expression', 'zeebe:Script')) {
    return [ 'scriptExpression' ];
  }

  if (isPropertyError(data, 'errorCode', 'bpmn:Error')) {
    return [ 'errorCode' ];
  }

  if (isPropertyError(data, 'escalationCode', 'bpmn:Escalation')) {
    return [ 'escalationCode' ];
  }

  if (isPropertyError(data, 'name', 'bpmn:Message')) {
    return [ 'messageName' ];
  }

  if (isPropertyError(data, 'name', 'bpmn:Signal')) {
    return [ 'signalName' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:LoopCharacteristics', 'bpmn:MultiInstanceLoopCharacteristics')
    || isPropertyError(data, 'inputCollection', 'zeebe:LoopCharacteristics')) {
    return [ 'multiInstance-inputCollection' ];
  }

  if (isPropertyDependentRequiredError(data, 'outputCollection', 'zeebe:LoopCharacteristics')) {
    return [ 'multiInstance-outputCollection' ];
  }

  if (isPropertyDependentRequiredError(data, 'outputElement', 'zeebe:LoopCharacteristics')) {
    return [ 'multiInstance-outputElement' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:CalledElement', 'bpmn:CallActivity')
    || isPropertyError(data, 'processId', 'zeebe:CalledElement')) {
    return [ 'targetProcessId' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:TaskDefinition')
    || isPropertyError(data, 'type', 'zeebe:TaskDefinition')) {
    return [ 'taskDefinitionType' ];
  }

  if (isPropertyError(data, 'retries', 'zeebe:TaskDefinition')) {
    return [ 'taskDefinitionRetries' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:Subscription')
    || isPropertyError(data, 'correlationKey', 'zeebe:Subscription')) {
    return [ 'messageSubscriptionCorrelationKey' ];
  }

  if (data.type === ERROR_TYPES.PROPERTY_DEPRECATED
    && isPropertyError(data, 'formKey', 'zeebe:FormDefinition')) {
    return [ 'formType' ];
  }

  if (isPropertyError(data, 'formKey', 'zeebe:FormDefinition')) {
    return [ 'customFormKey' ];
  }

  if (isType(data, 'zeebe:FormDefinition')) {
    const {
      node,
      requiredProperty
    } = data;

    if (isArray(requiredProperty)) {
      if (requiredProperty.includes('formKey') && isEmptyString(node.get('formKey'))) {
        return [ 'customFormKey' ];
      } else if (requiredProperty.includes('formId') && isEmptyString(node.get('formId'))) {
        return [ 'formId' ];
      } else if (requiredProperty.includes('externalReference') && isEmptyString(node.get('externalReference'))) {
        return [ 'externalReference' ];
      }
    }
  }

  if (isPropertyError(data, 'formId', 'zeebe:FormDefinition')) {
    return [ 'formId' ];
  }

  if (isPropertyError(data, 'body', 'zeebe:UserTaskForm')) {
    return [ 'formConfiguration' ];
  }

  if (isPropertyValueDuplicatedError(data, 'values', 'key', 'zeebe:TaskHeaders')) {
    const {
      node,
      properties,
      propertiesName
    } = data;

    const nodeParent = node.$parent;

    if (is(nodeParent, 'zeebe:ExecutionListener')) {
      const listenerIndex = nodeParent.$parent.get('listeners').indexOf(nodeParent);
      return properties.map(property => {
        const index = node.get(propertiesName).indexOf(property);

        return `${ id }-executionListener-${ listenerIndex }-headers-header-${ index }-key`;
      });
    }

    return properties.map(property => {
      const index = node.get(propertiesName).indexOf(property);

      return `${ id }-header-${ index }-key`;
    });
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:Properties')) {
    const { extensionElement } = data;

    return extensionElement.get('zeebe:properties').map((zeebeProperty, index) => {
      return `${ id }-extensionProperty-${ index }-name`;
    });
  }

  if (
    isExtensionElementNotAllowedError(data, 'zeebe:UserTask') ||
    isExtensionElementRequiredError(data, 'zeebe:UserTask')
  ) {
    return [ 'userTaskImplementation' ];
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:FormDefinition', 'bpmn:StartEvent')) {
    return [ 'formType' ];
  }


  if (isPropertyError(data, 'conditionExpression', 'bpmn:SequenceFlow')) {
    return [ 'conditionExpression' ];
  }

  if (isPropertyError(data, 'completionCondition', 'bpmn:MultiInstanceLoopCharacteristics')) {
    return [ 'multiInstance-completionCondition' ];
  }

  if (isPropertyError(data, 'completionCondition', 'bpmn:AdHocSubProcess')) {
    return [ 'completionCondition' ];
  }

  if (isPropertyError(data, 'cancelRemainingInstances', 'bpmn:AdHocSubProcess')) {
    return [ 'cancelRemainingInstances' ];
  }

  if (TIMER_PROPERTIES.some(property =>
    isOneOfPropertiesRequiredError(data, property, 'bpmn:TimerEventDefinition'))
  ) {
    return [ 'timerEventDefinitionType' ];
  }

  if (isExpressionRequiredError(data, 'timeCycle', 'bpmn:FormalExpression')
    || isExpressionRequiredError(data, 'timeDate', 'bpmn:FormalExpression')
    || isExpressionRequiredError(data, 'timeDuration', 'bpmn:FormalExpression')) {
    return [ 'timerEventDefinitionValue' ];
  }

  if (isExpressionValueNotAllowedError(data, 'timeCycle', 'bpmn:FormalExpression')
    || isExpressionValueNotAllowedError(data, 'timeDate', 'bpmn:FormalExpression')
    || isExpressionValueNotAllowedError(data, 'timeDuration', 'bpmn:FormalExpression')) {
    return [ 'timerEventDefinitionValue' ];
  }

  if (isPropertyError(data, 'timeCycle', 'bpmn:TimerEventDefinition')
    || isPropertyError(data, 'timeDate', 'bpmn:TimerEventDefinition')
    || isPropertyError(data, 'timeDuration', 'bpmn:TimerEventDefinition')) {
    return [ 'timerEventDefinitionType' ];
  }

  const LIST_PROPERTIES = [
    [ 'zeebe:Input', 'input' ],
    [ 'zeebe:Output', 'output' ],
    [ 'zeebe:Property', 'extensionProperty' ],
    [ 'zeebe:Header', 'header' ]
  ];

  for (const [ type, prefix ] of LIST_PROPERTIES) {
    if (isType(data, type)
        && getPropertyName(data)) {

      const index = path[ path.length - 2 ];

      return [ `${ id }-${ prefix }-${ index }-${ getPropertyName(data) }` ];
    }
  }

  if (isType(data, 'zeebe:LoopCharacteristics')) {
    return [ `multiInstance-${getPropertyName(data)}` ];
  }

  if (isPropertyError(data, 'candidateUsers', 'zeebe:AssignmentDefinition')) {
    return [ 'assignmentDefinitionCandidateUsers' ];
  }

  if (isPropertyError(data, 'historyTimeToLive', 'bpmn:Process')) {
    return [ 'historyTimeToLive' ];
  }

  if (isExpressionValueNotAllowedError(data, 'dueDate', 'zeebe:TaskSchedule')) {
    return [ 'taskScheduleDueDate' ];
  }

  if (isExpressionValueNotAllowedError(data, 'followUpDate', 'zeebe:TaskSchedule')) {
    return [ 'taskScheduleFollowUpDate' ];
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:TaskSchedule', 'bpmn:UserTask')) {
    const { extensionElement: taskSchedule } = data;

    let ids = [];

    if (taskSchedule.get('dueDate')) {
      ids = [ ...ids, 'taskScheduleDueDate' ];
    }

    if (taskSchedule.get('followUpDate')) {
      ids = [ ...ids, 'taskScheduleFollowUpDate' ];
    }

    return ids;
  }

  if (isExpressionValueNotAllowedError(data, 'priority', 'zeebe:PriorityDefinition')
    || isExtensionElementNotAllowedError(data, 'zeebe:PriorityDefinition', 'bpmn:UserTask')) {
    return [ 'priorityDefinitionPriority' ];
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:JobPriorityDefinition')) {
    return [ 'jobPriorityDefinitionPriority' ];
  }

  if (isPropertyError(data, 'propagateAllParentVariables', 'zeebe:CalledElement')) {
    return [ 'propagateAllParentVariables' ];
  }

  if (isPropertyError(data, 'name', 'bpmn:LinkEventDefinition')
    || isElementPropertyValueDuplicated(data, 'name', 'bpmn:LinkEventDefinition')) {
    return [ 'linkName' ];
  }

  if (isPropertyError(data, 'waitForCompletion', 'bpmn:CompensateEventDefinition')) {
    return [ 'waitForCompletion' ];
  }

  if (isPropertyError(data, 'type', 'zeebe:ExecutionListener')) {
    const index = path[ path.length - 2 ];

    return [ `${id}-executionListener-${index}-listenerType` ];
  }

  if (isPropertyError(data, 'eventType', 'zeebe:ExecutionListener')) {
    const index = path[ path.length - 2 ];

    return [ `${id}-executionListener-${index}-eventType` ];
  }

  if (isPropertyValuesDuplicatedError(data, 'zeebe:ExecutionListeners')) {
    const { properties, propertiesName } = data;

    return properties.map(property => {
      const index = data.node.get(propertiesName).indexOf(property);

      return `${ id }-executionListener-${ index }-listenerType`;
    });
  }

  if (isPropertyError(data, 'type', 'zeebe:TaskListener')) {
    const index = path[ path.length - 2 ];

    return [ `${id}-taskListener-${index}-listenerType` ];
  }

  if (isPropertyError(data, 'bindingType')) {
    return [ 'bindingType' ];
  }

  if (isPropertyError(data, 'businessId')) {
    return [ 'businessId' ];
  }

  if (isPropertyError(data, 'versionTag') || isExtensionElementNotAllowedError(data, 'zeebe:VersionTag')) {
    return [ 'versionTag' ];
  }

  // (1) match dependent property errors first
  if (isPropertyDependentRequiredError(data, 'outputCollection', 'zeebe:AdHoc')) {
    return [ 'adHocOutputCollection' ];
  }

  if (isPropertyDependentRequiredError(data, 'outputElement', 'zeebe:AdHoc')) {
    return [ 'adHocOutputElement' ];
  }

  // (2) match property errors second
  if (isPropertyError(data, 'outputCollection', 'zeebe:AdHoc')) {
    return [ 'adHocOutputCollection' ];
  }

  if (isPropertyError(data, 'outputElement', 'zeebe:AdHoc')) {
    return [ 'adHocOutputElement' ];
  }

  // Fallback for bpmnlint rules that use path without data
  // (e.g., bpmnlint/conditional-event)
  if (path && path.length && !data.type) {

    const property = path[path.length - 1];

    if (property === 'condition') {
      return [ 'condition' ];
    }
  }

  return [];
}

export function getErrorMessage(id, report) {
  const {
    data = {},
    executionPlatformVersion,
    message
  } = report;

  const {
    type,
    allowedVersion
  } = data;

  // adjust FEEL message
  if (type === ERROR_TYPES.FEEL_EXPRESSION_INVALID) {
    return 'Unparsable FEEL expression.';
  }

  if (type === ERROR_TYPES.EXPRESSION_NOT_ALLOWED) {
    return 'Cannot be an expression.';
  }

  if (id === 'isExecutable') {
    const { parentNode } = data;

    if (parentNode && is(parentNode, 'bpmn:Participant')) {
      return 'One process must be executable.';
    } else {
      return 'Process must be executable.';
    }
  }

  if ([ 'businessRuleImplementation', 'scriptImplementation' ].includes(id)) {
    return 'Implementation must be defined.';
  }

  if (id === 'errorRef') {
    return 'Global error reference must be defined.';
  }

  if (id === 'escalationRef') {
    return 'Global escalation reference must be defined.';
  }

  if (id === 'messageRef') {
    return 'Global message reference must be defined.';
  }

  if (id === 'signalRef') {
    return 'Global signal reference must be defined.';
  }

  if (id === 'decisionId') {
    return 'Decision ID must be defined.';
  }

  if (id === 'scriptExpression') {
    return 'FEEL expression must be defined.';
  }

  if (id === 'errorCode' && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Code must be defined.';
  }

  if (id === 'escalationCode' && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Code must be defined.';
  }

  if (id === 'messageName') {
    return 'Name must be defined.';
  }

  if (id === 'signalName') {
    return 'Name must be defined.';
  }

  if (id === 'multiInstance-inputCollection') {
    return 'Input collection must be defined.';
  }

  if (id === 'multiInstance-outputElement') {
    return 'Output element must be defined.';
  }

  if (id === 'completionCondition' && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (id === 'cancelRemainingInstances' && type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
    return 'Must be checked.';
  }

  if (id === 'targetProcessId') {
    return 'Process ID must be defined.';
  }

  if (id === 'taskDefinitionType') {
    return 'Type must be defined.';
  }

  if (id === 'timerEventDefinitionType' && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Type must be defined.';
  }

  if (id === 'messageSubscriptionCorrelationKey'
    && [
      ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
      ERROR_TYPES.PROPERTY_REQUIRED
    ].includes(type)) {
    return 'Subscription correlation key must be defined.';
  }

  if (id === 'customFormKey') {
    return 'Form key must be defined.';
  }

  if (id === 'formId') {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Form ID must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
      return getNotSupportedMessage('Form ID', allowedVersion);
    }
  }

  if (id === 'externalReference') {
    return 'External reference must be defined.';
  }

  if (id === 'formConfiguration') {
    return 'Form JSON configuration must be defined.';
  }

  if (/^.+-header-[0-9]+-key$/.test(id)) {
    return 'Must be unique.';
  }

  if (/^.+-extensionProperty-[0-9]+-name$/.test(id)) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (id === 'userTaskImplementation') {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    } else if (type === ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED) {
      return getNotSupportedMessage('');
    }
  }

  if (id === 'formType' && type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (id === 'conditionExpression') {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Condition expression must be defined.';
    }

    return message;
  }

  if (id === 'timerEventDefinitionType' && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getNotSupportedMessage('Type', allowedVersion);
  }

  if (id === 'timerEventDefinitionValue') {
    if (type === ERROR_TYPES.EXPRESSION_REQUIRED) {
      return 'Value must be defined.';
    }

    const { property } = data;

    if (property === 'timeCycle') {
      if (!greaterOrEqual(executionPlatformVersion, '8.1')) {
        return 'Must be an expression, an ISO 8601 repeating interval, or a cron expression (cron only supported by Camunda 8.1 or newer).';
      }

      return 'Must be an expression, an ISO 8601 repeating interval, or a cron expression.';
    }

    if (property === 'timeDate') {
      return 'Must be an expression, or an ISO 8601 date.';
    }

    if (property === 'timeDuration') {
      return 'Must be an expression, or an ISO 8601 interval.';
    }
  }

  if (id === 'assignmentDefinitionCandidateUsers') {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (id === 'taskScheduleDueDate') {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    } else {
      return 'Must be an ISO 8601 date.';
    }
  }

  if (id === 'taskScheduleFollowUpDate') {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    } else {
      return 'Must be an ISO 8601 date.';
    }
  }

  if (id === 'priorityDefinitionPriority') {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    } else {
      return 'Must be an expression, or an integer between 0 and 100.';
    }
  }

  if (id === 'jobPriorityDefinitionPriority') {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (id === 'propagateAllParentVariables') {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (id === 'linkName') {
    if (type === ERROR_TYPES.ELEMENT_PROPERTY_VALUE_DUPLICATED) {
      return 'Must be unique.';
    } else {
      return 'Must be defined.';
    }
  }

  if (id === 'waitForCompletion') {
    return 'Must wait for completion.';
  }

  if (/^.+-executionListener-[0-9]+-listenerType$/.test(id)) {
    if (type === ERROR_TYPES.PROPERTY_VALUES_DUPLICATED) {
      return 'Must be unique.';
    } else {
      return 'Must be defined.';
    }
  }

  if (/^.+-executionListener-[0-9]+-eventType$/.test(id)) {
    if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    }
  }

  if (/^.+-taskListener-[0-9]+-listenerType$/.test(id)) {
    return 'Must be defined.';
  }

  if (/^.+-(?:input|output)-[0-9]+-source$/.test(id) && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    if (allowedVersion) {
      return `Empty variable assignment is only supported by Camunda ${allowedVersion} or newer.`;
    }
    return 'Variable assignment must be defined.';
  }

  if (/^.+-(?:input|output)-[0-9]+-target$/.test(id) && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Variable name must be defined.';
  }

  if (/^.+-(?:input|output)-[0-9]+-target$/.test(id) && type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
    return INVALID_VARIABLE_NAME_ERROR;
  }

  if (id === 'resultVariable') {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Result variable must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  if (id === 'multiInstance-outputCollection') {
    if (type === ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED || type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Output collection must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  if (id === 'multiInstance-inputElement') {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Input element must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  if (id === 'adHocOutputCollection') {
    if (type === ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED || type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Output collection must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
      return getNotSupportedMessage('Output collection', allowedVersion);
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  if (id === 'adHocOutputElement') {
    if (type === ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED || type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Output element must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
      return getNotSupportedMessage('Output element', allowedVersion);
    }
  }

  if (id === 'bindingType') {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (id === 'businessId') {
    if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return 'Business ID must be shorter than 256 characters.';
    }

    return getNotSupportedMessage('Business ID', allowedVersion);
  }

  if (id === 'versionTag') {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return getNotSupportedMessage('Version tag expression', allowedVersion);
    } else {
      return 'Version tag must be defined.';
    }
  }

  if (isPropertyDependentRequiredError(data, 'outputElement', 'zeebe:AdHoc')) {
    return 'Output element must be defined.';
  }

  if (isPropertyError(data, 'outputCollection', 'zeebe:AdHoc') && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getNotSupportedMessage('Output collection', allowedVersion);
  }

  if (isPropertyError(data, 'outputElement', 'zeebe:AdHoc') && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getNotSupportedMessage('Output element', allowedVersion);
  }

  if (id === 'condition') {
    return 'Condition expression must be defined.';
  }

  if (id === 'variableNames') {
    return message ?? 'Invalid variables list.';
  }
}

function isExtensionElementNotAllowedError(data, extensionElement, type) {
  return data.type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED
    && is(data.extensionElement, extensionElement)
    && (!type || is(data.node, type));
}

function isExtensionElementRequiredError(data, requiredExtensionElement, type) {
  return data.type === ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED
    && (isArray(data.requiredExtensionElement) && data.requiredExtensionElement.includes(requiredExtensionElement)
      || data.requiredExtensionElement === requiredExtensionElement)
    && (!type || is(data.node, type));
}

function isPropertyDependentRequiredError(data, dependentRequiredProperty, type) {
  return data.type === ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED
    && data.dependentRequiredProperty === dependentRequiredProperty
    && (!type || is(data.node, type));
}


function isPropertyError(data, property, type) {
  return getPropertyName(data) === property
    && (!type || is(data.node, type));
}

function getPropertyName(data) {
  if (data.type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return data.requiredProperty;
  }

  return data.property;
}

function isType(data, type) {
  return data.node && is(data.node, type);
}

function isOneOfPropertiesRequiredError(data, requiredProperty, type) {
  return data.type === ERROR_TYPES.PROPERTY_REQUIRED
    && (isArray(data.requiredProperty) && data.requiredProperty.includes(requiredProperty))
    && (!type || is(data.node, type));
}

function isPropertyValueDuplicatedError(data, propertiesName, duplicatedProperty, type) {
  return data.type === ERROR_TYPES.PROPERTY_VALUE_DUPLICATED
    && data.propertiesName === propertiesName
    && data.duplicatedProperty === duplicatedProperty
    && (!type || is(data.node, type));
}

function isPropertyValuesDuplicatedError(data, type) {
  return data.type === ERROR_TYPES.PROPERTY_VALUES_DUPLICATED
    && (!type || is(data.node, type));
}

function isExpressionRequiredError(data, propertyName, type) {
  return data.type === ERROR_TYPES.EXPRESSION_REQUIRED
    && data.property === propertyName
    && (!type || is(data.node, type));
}

function isExpressionValueNotAllowedError(data, propertyName, type) {
  return data.type === ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED
    && data.property === propertyName
    && (!type || is(data.node, type));
}

function isElementPropertyValueDuplicated(data, propertyName, type) {
  return data.type === ERROR_TYPES.ELEMENT_PROPERTY_VALUE_DUPLICATED
    && data.duplicatedProperty === propertyName
    && (!type || is(data.node, type));
}

function getBusinessObject(element) {
  return element.businessObject || element;
}

function isEmptyString(value) {
  return isString(value) && value.trim() === '';
}

function getNotSupportedMessage(property, allowedVersion) {

  if (allowedVersion) {
    return property ?
      `${ property } is only supported by Camunda ${ allowedVersion } or newer.` :
      `Only supported by Camunda ${ allowedVersion } or newer.`;
  }

  return property ? `${ property } is not supported.` : 'Not supported.';
}