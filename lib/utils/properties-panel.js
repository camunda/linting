import {
  isArray,
  isString
} from 'min-dash';

import { is } from 'bpmnlint-utils';

import { getPath } from '@bpmn-io/moddle-utils';

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
 * @param {Object} [propertiesPanel] properties panel service used to resolve
 * entry ids via its #getEntryId(element, path) API before falling back to the
 * custom handling
 *
 * @returns {Object}
 */
export function getErrors(reports, element, propertiesPanel) {
  return reports.reduce((errors, report) => {
    const { category } = report;

    if (!element
      || !isReportForElement(report, element)
      || category !== 'error') {
      return errors;
    }

    const ids = getReportEntryIds(report, element, propertiesPanel);

    if (!ids.length) {
      return errors;
    }

    const { message } = report;

    const errorMessage = getErrorMessage(report) || message;

    return {
      ...errors,
      ...ids.reduce((errors, id) => {
        return {
          ...errors,
          [ id ]: errorMessage
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
 * Resolve the entry ids for a report, preferring the live
 * propertiesPanel#getEntryId(element, path) API and falling back to the
 * hand-maintained mapping when the API is unavailable or cannot resolve
 * every target the report points to.
 *
 * @param {Object} report
 * @param {Object} element
 * @param {Object} [propertiesPanel]
 *
 * @returns {string[]}
 */
export function getReportEntryIds(report, element, propertiesPanel) {
  const entryIds = resolveEntryIdsFromApi(report, element, propertiesPanel);

  if (entryIds && entryIds.length) {
    return entryIds;
  }

  return getEntryIds(report);
}

/**
 * Resolve every moddle target a report points to through the properties
 * panel's #getEntryId(element, path) API.
 *
 * A report may target a single property (its own `path`) or, for duplicate
 * value errors, multiple offending nodes (`data.properties`). Each target is
 * resolved individually and the result is trusted only when the API resolves
 * ALL of them (all-or-nothing). Otherwise the custom handling — which maps
 * to entries the API cannot yet resolve (e.g. nested execution listener
 * headers or listener types) — must handle the whole report.
 *
 * @param {Object} report
 * @param {Object} element
 * @param {Object} [propertiesPanel]
 *
 * @returns {string[]|null}
 */
function resolveEntryIdsFromApi(report, element, propertiesPanel) {
  if (!element
    || !propertiesPanel
    || typeof propertiesPanel.getEntryId !== 'function') {
    return null;
  }

  const paths = getReportPaths(report, element);

  if (!paths.length) {
    return null;
  }

  const entryIds = paths.map(path => propertiesPanel.getEntryId(element, path));

  return entryIds.every(Boolean) ? entryIds : null;
}

/**
 * Get the business-object-relative moddle path(s) a report targets: the
 * offending nodes of a duplicate value error, or the report's own path.
 *
 * @param {Object} report
 * @param {Object} element
 *
 * @returns {Array<Array<string|number>>}
 */
function getReportPaths(report, element) {
  const { data = {}, path } = report;

  const { duplicatedProperty, properties } = data;

  // duplicate value errors mark every offending node instead of a single
  // path; resolve each node relative to the business object and, when known,
  // point at the duplicated property (e.g. a task header's `key`)
  if (isArray(properties) && properties.length) {
    const businessObject = getBusinessObject(element);

    return properties
      .map(node => getPath(node, businessObject))
      .filter(Boolean)
      .map(nodePath => duplicatedProperty ? [ ...nodePath, duplicatedProperty ] : nodePath);
  }

  return isArray(path) && path.length ? [ path ] : [];
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

/**
 * Get the adjusted error message for a report, derived from the report's
 * own data (the semantics of the error) rather than from a resolved entry
 * id — so it stays correct no matter which properties panel entry ends up
 * displaying it (e.g. when an element template shadows the standard entry
 * with its own `custom-entry-*` id).
 *
 * @param {Object} report
 *
 * @returns {string|undefined}
 */
export function getErrorMessage(report) {
  const {
    data = {},
    path,
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

  if (isPropertyError(data, 'isExecutable')) {
    const { parentNode } = data;

    if (parentNode && is(parentNode, 'bpmn:Participant')) {
      return 'One process must be executable.';
    } else {
      return 'Process must be executable.';
    }
  }

  if (isExtensionElementRequiredError(data, 'zeebe:CalledDecision', 'bpmn:BusinessRuleTask')
    || isExtensionElementRequiredError(data, 'zeebe:Script', 'bpmn:ScriptTask')) {
    return 'Implementation must be defined.';
  }

  if (isPropertyError(data, 'errorRef')) {
    return 'Global error reference must be defined.';
  }

  if (isPropertyError(data, 'escalationRef')) {
    return 'Global escalation reference must be defined.';
  }

  if (isPropertyError(data, 'messageRef')) {
    return 'Global message reference must be defined.';
  }

  if (isPropertyError(data, 'signalRef')) {
    return 'Global signal reference must be defined.';
  }

  if (isPropertyError(data, 'decisionId', 'zeebe:CalledDecision')) {
    return 'Decision ID must be defined.';
  }

  if (isPropertyError(data, 'expression', 'zeebe:Script')) {
    return 'FEEL expression must be defined.';
  }

  if (isPropertyError(data, 'errorCode', 'bpmn:Error') && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Code must be defined.';
  }

  if (isPropertyError(data, 'escalationCode', 'bpmn:Escalation') && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Code must be defined.';
  }

  if (isPropertyError(data, 'name', 'bpmn:Message')) {
    return 'Name must be defined.';
  }

  if (isPropertyError(data, 'name', 'bpmn:Signal')) {
    return 'Name must be defined.';
  }

  if (isExtensionElementRequiredError(data, 'zeebe:LoopCharacteristics', 'bpmn:MultiInstanceLoopCharacteristics')
    || isPropertyError(data, 'inputCollection', 'zeebe:LoopCharacteristics')) {
    return 'Input collection must be defined.';
  }

  if (isPropertyDependentRequiredError(data, 'outputElement', 'zeebe:LoopCharacteristics')) {
    return 'Output element must be defined.';
  }

  if (isExtensionElementRequiredError(data, 'zeebe:CalledElement', 'bpmn:CallActivity')
    || isPropertyError(data, 'processId', 'zeebe:CalledElement')) {
    return 'Process ID must be defined.';
  }

  if (isExtensionElementRequiredError(data, 'zeebe:TaskDefinition')
    || isPropertyError(data, 'type', 'zeebe:TaskDefinition')) {
    return 'Type must be defined.';
  }

  if (isExtensionElementRequiredError(data, 'zeebe:Subscription')
    || isPropertyError(data, 'correlationKey', 'zeebe:Subscription')) {
    if ([
      ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
      ERROR_TYPES.PROPERTY_REQUIRED
    ].includes(type)) {
      return 'Subscription correlation key must be defined.';
    }
  }

  // a deprecated form key gets no adjusted message; this must be checked
  // before the plain form key check below, which has no `data.type`
  // restriction of its own and would otherwise also match here
  if (data.type === ERROR_TYPES.PROPERTY_DEPRECATED
    && isPropertyError(data, 'formKey', 'zeebe:FormDefinition')) {
    return;
  }

  if (isPropertyError(data, 'formKey', 'zeebe:FormDefinition')) {
    return 'Form key must be defined.';
  }

  if (isType(data, 'zeebe:FormDefinition')) {
    const {
      node,
      requiredProperty
    } = data;

    if (isArray(requiredProperty)) {
      if (requiredProperty.includes('formKey') && isEmptyString(node.get('formKey'))) {
        return 'Form key must be defined.';
      } else if (requiredProperty.includes('formId') && isEmptyString(node.get('formId'))) {
        return 'Form ID must be defined.';
      } else if (requiredProperty.includes('externalReference') && isEmptyString(node.get('externalReference'))) {
        return 'External reference must be defined.';
      }
    }
  }

  if (isPropertyError(data, 'formId', 'zeebe:FormDefinition')) {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Form ID must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
      return getNotSupportedMessage('Form ID', allowedVersion);
    }
  }

  if (isPropertyError(data, 'body', 'zeebe:UserTaskForm')) {
    return 'Form JSON configuration must be defined.';
  }

  if (isPropertyValueDuplicatedError(data, 'values', 'key', 'zeebe:TaskHeaders')) {
    return 'Must be unique.';
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:Properties')) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:UserTask')
    || isExtensionElementRequiredError(data, 'zeebe:UserTask')) {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    } else if (type === ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED) {
      return getNotSupportedMessage('');
    }
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:FormDefinition', 'bpmn:StartEvent')) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isPropertyError(data, 'conditionExpression', 'bpmn:SequenceFlow')) {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Condition expression must be defined.';
    }

    return message;
  }

  if (isPropertyError(data, 'completionCondition', 'bpmn:AdHocSubProcess') && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isPropertyError(data, 'cancelRemainingInstances', 'bpmn:AdHocSubProcess') && type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
    return 'Must be checked.';
  }

  if (TIMER_PROPERTIES.some(property =>
    isOneOfPropertiesRequiredError(data, property, 'bpmn:TimerEventDefinition'))
    && type === ERROR_TYPES.PROPERTY_REQUIRED
  ) {
    return 'Type must be defined.';
  }

  if (isExpressionValueNotAllowedError(data, 'timeCycle', 'bpmn:FormalExpression')
    || isExpressionValueNotAllowedError(data, 'timeDate', 'bpmn:FormalExpression')
    || isExpressionValueNotAllowedError(data, 'timeDuration', 'bpmn:FormalExpression')
    || isExpressionRequiredError(data, 'timeCycle', 'bpmn:FormalExpression')
    || isExpressionRequiredError(data, 'timeDate', 'bpmn:FormalExpression')
    || isExpressionRequiredError(data, 'timeDuration', 'bpmn:FormalExpression')) {

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

  if (isPropertyError(data, 'timeCycle', 'bpmn:TimerEventDefinition') && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED
    || isPropertyError(data, 'timeDate', 'bpmn:TimerEventDefinition') && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED
    || isPropertyError(data, 'timeDuration', 'bpmn:TimerEventDefinition') && type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getNotSupportedMessage('Type', allowedVersion);
  }

  if (isPropertyError(data, 'candidateUsers', 'zeebe:AssignmentDefinition')) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:TaskSchedule', 'bpmn:UserTask')) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isExpressionValueNotAllowedError(data, 'dueDate', 'zeebe:TaskSchedule')
    || isExpressionValueNotAllowedError(data, 'followUpDate', 'zeebe:TaskSchedule')) {
    return 'Must be an ISO 8601 date.';
  }

  if (isExpressionValueNotAllowedError(data, 'priority', 'zeebe:PriorityDefinition')
    || isExtensionElementNotAllowedError(data, 'zeebe:PriorityDefinition', 'bpmn:UserTask')) {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    }

    return 'Must be an expression, or an integer between 0 and 100.';
  }

  if (isExtensionElementNotAllowedError(data, 'zeebe:JobPriorityDefinition')) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isPropertyError(data, 'propagateAllParentVariables', 'zeebe:CalledElement')) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isPropertyError(data, 'name', 'bpmn:LinkEventDefinition')
    || isElementPropertyValueDuplicated(data, 'name', 'bpmn:LinkEventDefinition')) {
    if (type === ERROR_TYPES.ELEMENT_PROPERTY_VALUE_DUPLICATED) {
      return 'Must be unique.';
    } else {
      return 'Must be defined.';
    }
  }

  if (isPropertyError(data, 'waitForCompletion', 'bpmn:CompensateEventDefinition')) {
    return 'Must wait for completion.';
  }

  if (isPropertyError(data, 'type', 'zeebe:ExecutionListener')
    || isPropertyValuesDuplicatedError(data, 'zeebe:ExecutionListeners')) {
    if (type === ERROR_TYPES.PROPERTY_VALUES_DUPLICATED) {
      return 'Must be unique.';
    } else {
      return 'Must be defined.';
    }
  }

  if (isPropertyError(data, 'eventType', 'zeebe:ExecutionListener') && type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isPropertyError(data, 'type', 'zeebe:TaskListener')) {
    return 'Must be defined.';
  }

  if ((isType(data, 'zeebe:Input') || isType(data, 'zeebe:Output'))
    && getPropertyName(data) === 'source'
    && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    if (allowedVersion) {
      return `Empty variable assignment is only supported by Camunda ${allowedVersion} or newer.`;
    }

    return 'Variable assignment must be defined.';
  }

  if ((isType(data, 'zeebe:Input') || isType(data, 'zeebe:Output'))
    && getPropertyName(data) === 'target'
    && type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Variable name must be defined.';
  }

  if ((isType(data, 'zeebe:Input') || isType(data, 'zeebe:Output'))
    && getPropertyName(data) === 'target'
    && type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
    return INVALID_VARIABLE_NAME_ERROR;
  }

  if (isPropertyError(data, 'resultVariable')) {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Result variable must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  if (isPropertyDependentRequiredError(data, 'outputCollection', 'zeebe:LoopCharacteristics')
    || (isType(data, 'zeebe:LoopCharacteristics') && getPropertyName(data) === 'outputCollection')) {
    if (type === ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED || type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Output collection must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  if (isType(data, 'zeebe:LoopCharacteristics') && getPropertyName(data) === 'inputElement') {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Input element must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  // (1) match dependent property errors first — a dependent-required error's
  // `data.property` holds the *dependency* name (e.g. 'outputCollection'),
  // not the missing property, so the plain property checks below would
  // otherwise also match here and return the wrong message
  if (isPropertyDependentRequiredError(data, 'outputCollection', 'zeebe:AdHoc')) {
    return 'Output collection must be defined.';
  }

  if (isPropertyDependentRequiredError(data, 'outputElement', 'zeebe:AdHoc')) {
    return 'Output element must be defined.';
  }

  // (2) match property errors second
  if (isPropertyError(data, 'outputCollection', 'zeebe:AdHoc')) {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Output collection must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
      return getNotSupportedMessage('Output collection', allowedVersion);
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return INVALID_VARIABLE_NAME_ERROR;
    }
  }

  if (isPropertyError(data, 'outputElement', 'zeebe:AdHoc')) {
    if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
      return 'Output element must be defined.';
    } else if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
      return getNotSupportedMessage('Output element', allowedVersion);
    }
  }

  if (isPropertyError(data, 'bindingType')) {
    return getNotSupportedMessage('', allowedVersion);
  }

  if (isPropertyError(data, 'versionTag') || isExtensionElementNotAllowedError(data, 'zeebe:VersionTag')) {
    if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return getNotSupportedMessage('', allowedVersion);
    } else if (type === ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
      return getNotSupportedMessage('Version tag expression', allowedVersion);
    } else {
      return 'Version tag must be defined.';
    }
  }

  // Fallback for bpmnlint rules that use path without data
  // (e.g., bpmnlint/conditional-event)
  if (path && path.length && !data.type) {

    const property = path[path.length - 1];

    if (property === 'condition') {
      return 'Condition expression must be defined.';
    }
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