import { isArray } from 'min-dash';

import { is } from 'bpmnlint-utils';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

import { greaterOrEqual } from './version';

const TIMER_PROPERTIES = [
  'timeDate',
  'timeDuration',
  'timeCycle'
];

/**
 * Get errors for a given element.
 *
 * @param {Object[]} reports
 * @param {Object} element
 *
 * @returns {Object}
 */
export function getErrors(reports, element) {
  return reports.reduce((errors, report) => {
    const { category } = report;

    if (!element
      || getBusinessObject(element).get('id') !== report.id
      || category !== 'error') {
      return errors;
    }

    const ids = getEntryIds(report);

    if (!ids.length) {
      return errors;
    }

    let { message } = report;

    return {
      ...errors,
      ...ids.reduce((errors, id) => {
        return {
          ...errors,
          [ id ]: getErrorMessage(id, report) || message
        };
      }, {})
    };
  }, {});
}

export function getEntryIds(report) {
  const {
    data = {},
    id,
    path,
    propertiesPanel = {}
  } = report;

  if (propertiesPanel.entryIds) {
    return propertiesPanel.entryIds;
  }

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

  if (isPropertyError(data, 'formKey', 'zeebe:FormDefinition')) {
    return [ 'customFormKey' ];
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

  if (isExtensionElementNotAllowedError(data, 'zeebe:FormDefinition', 'bpmn:StartEvent')) {
    return [ 'formType' ];
  }


  if (isPropertyError(data, 'conditionExpression', 'bpmn:SequenceFlow')) {
    return [ 'conditionExpression' ];
  }

  if (isPropertyError(data, 'completionCondition', 'bpmn:MultiInstanceLoopCharacteristics')) {
    return [ 'multiInstance-completionCondition' ];
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

  if (isPropertyError(data, 'propagateAllParentVariables', 'zeebe:CalledElement')) {
    return [ 'propagateAllParentVariables' ];
  }

  if (isPropertyError(data, 'name', 'bpmn:LinkEventDefinition')
    || isElementPropertyValueDuplicated(data, 'name', 'bpmn:LinkEventDefinition')) {
    return [ 'linkName' ];
  }

  return [];
}

export function getErrorMessage(id, report) {
  const {
    data = {},
    executionPlatformVersion
  } = report;

  // do not override FEEL message
  if (data.type === ERROR_TYPES.FEEL_EXPRESSION_INVALID) {
    return;
  }

  if (data.type === ERROR_TYPES.EXPRESSION_NOT_ALLOWED) {
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

  if (id === 'resultVariable') {
    return 'Result variable must be defined.';
  }

  if (id === 'errorCode' && data.type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Code must be defined.';
  }

  if (id === 'escalationCode' && data.type === ERROR_TYPES.PROPERTY_REQUIRED) {
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

  if (id === 'multiInstance-outputCollection') {
    return 'Output collection must be defined.';
  }

  if (id === 'multiInstance-outputElement') {
    return 'Output element must be defined.';
  }

  if (id === 'targetProcessId') {
    return 'Process ID must be defined.';
  }

  if (id === 'taskDefinitionType') {
    return 'Type must be defined.';
  }

  if (id === 'timerEventDefinitionType' && data.type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return 'Type must be defined.';
  }

  if (id === 'messageSubscriptionCorrelationKey'
    && [
      ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED,
      ERROR_TYPES.PROPERTY_REQUIRED
    ].includes(data.type)) {
    return 'Subscription correlation key must be defined.';
  }

  if (id === 'customFormKey') {
    return 'Form key must be defined.';
  }

  if (id === 'formConfiguration') {
    return 'Form JSON configuration must be defined.';
  }

  if (/^.+-header-[0-9]+-key$/.test(id)) {
    return 'Must be unique.';
  }

  if (/^.+-extensionProperty-[0-9]+-name$/.test(id)) {
    return 'Not supported.';
  }

  if (id === 'conditionExpression') {
    return 'Condition expression must be defined.';
  }

  if (id === 'timerEventDefinitionType' && data.type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return 'Type not supported.';
  }

  if (id === 'timerEventDefinitionValue') {
    if (data.type === ERROR_TYPES.EXPRESSION_REQUIRED) {
      return 'Value must be defined.';
    }

    const { property } = data;

    if (property === 'timeCycle') {
      if (!greaterOrEqual(executionPlatformVersion, '8.1')) {
        return 'Must be an expression, an ISO 8601 repeating interval, or a cron expression (cron only supported by Camunda Platform 8.1 or newer).';
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
    return 'Not supported.';
  }

  if (id === 'historyTimeToLive') {
    return 'Time to live must be defined.';
  }

  if (id === 'taskScheduleDueDate') {
    if (data.type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return 'Not supported.';
    } else {
      return 'Must be an ISO 8601 date.';
    }
  }

  if (id === 'taskScheduleFollowUpDate') {
    if (data.type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
      return 'Not supported.';
    } else {
      return 'Must be an ISO 8601 date.';
    }
  }

  if (id === 'propagateAllParentVariables') {
    return 'Not supported.';
  }

  if (id === 'linkName') {
    if (data.type === ERROR_TYPES.ELEMENT_PROPERTY_VALUE_DUPLICATED) {
      return 'Must be unique.';
    } else {
      return 'Must be defined.';
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