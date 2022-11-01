import { isArray } from 'min-dash';

import { is } from 'bpmnlint-utils';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

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
    if (!element || getBusinessObject(element).get('id') !== report.id) {
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
    id
  } = report;

  if (isExtensionElementRequiredError(data, 'zeebe:CalledDecision', 'bpmn:BusinessRuleTask')) {
    return [ 'businessRuleImplementation' ];
  }

  if (isPropertyRequiredError(data, 'errorRef')) {
    return [ 'errorRef' ];
  }

  if (isPropertyRequiredError(data, 'messageRef')) {
    return [ 'messageRef' ];
  }

  if (isPropertyRequiredError(data, 'decisionId', 'zeebe:CalledDecision')) {
    return [ 'decisionId' ];
  }

  if (isPropertyRequiredError(data, 'resultVariable', 'zeebe:CalledDecision')) {
    return [ 'resultVariable' ];
  }

  if (isPropertyRequiredError(data, 'errorCode', 'bpmn:Error')) {
    return [ 'errorCode' ];
  }

  if (isPropertyRequiredError(data, 'name', 'bpmn:Message')) {
    return [ 'messageName' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:LoopCharacteristics', 'bpmn:MultiInstanceLoopCharacteristics')
    || isPropertyRequiredError(data, 'inputCollection', 'zeebe:LoopCharacteristics')) {
    return [ 'multiInstance-inputCollection' ];
  }

  if (isPropertyDependendRequiredError(data, 'outputCollection', 'zeebe:LoopCharacteristics')) {
    return [ 'multiInstance-outputCollection' ];
  }

  if (isPropertyDependendRequiredError(data, 'outputElement', 'zeebe:LoopCharacteristics')) {
    return [ 'multiInstance-outputElement' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:CalledElement', 'bpmn:CallActivity')
    || isPropertyRequiredError(data, 'processId', 'zeebe:CalledElement')) {
    return [ 'targetProcessId' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:TaskDefinition')
    || isPropertyRequiredError(data, 'type', 'zeebe:TaskDefinition')) {
    return [ 'taskDefinitionType' ];
  }

  if (isExtensionElementRequiredError(data, 'zeebe:Subscription')
    || isPropertyRequiredError(data, 'correlationKey', 'zeebe:Subscription')) {
    return [ 'messageSubscriptionCorrelationKey' ];
  }

  if (isPropertyRequiredError(data, 'formKey', 'zeebe:FormDefinition')) {
    return [ 'customFormKey' ];
  }

  if (isPropertyRequiredError(data, 'body', 'zeebe:UserTaskForm')) {
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

  if (isPropertyRequiredError(data, 'conditionExpression', 'bpmn:SequenceFlow')) {
    return [ 'conditionExpression' ];
  }

  if (isPropertyRequiredError(data, 'timeDuration', 'bpmn:TimerEventDefinition')) {
    return [ 'timerEventDefinitionDurationValue' ];
  }

  if (TIMER_PROPERTIES.some(property =>
    isOneOfPropertiesRequiredError(data, property , 'bpmn:TimerEventDefinition'))
  ) {
    return [ 'timerEventDefinitionType' ];
  }

  if (isExpressionRequiredError(data, 'timeCycle', 'bpmn:FormalExpression')
    || isExpressionRequiredError(data, 'timeDate', 'bpmn:FormalExpression')
    || isExpressionRequiredError(data, 'timeDuration', 'bpmn:FormalExpression')) {
    return hasOnlyDurationTimer(data.parentNode) ? [ 'timerEventDefinitionDurationValue' ] : [ 'timerEventDefinitionValue' ];
  }

  if (isExpressionValueNotAllowedError(data, 'timeCycle', 'bpmn:FormalExpression')
    || isExpressionValueNotAllowedError(data, 'timeDate', 'bpmn:FormalExpression')
    || isExpressionValueNotAllowedError(data, 'timeDuration', 'bpmn:FormalExpression')) {
    return hasOnlyDurationTimer(data.parentNode) ? [ 'timerEventDefinitionDurationValue' ] : [ 'timerEventDefinitionValue' ];
  }

  return [];
}

export function getErrorMessage(id, report) {
  const { data } = report;

  if (id === 'businessRuleImplementation') {
    return 'Implementation must be defined.';
  }

  if (id === 'errorRef') {
    return 'Global error reference must be defined.';
  }

  if (id === 'messageRef') {
    return 'Global message reference must be defined.';
  }

  if (id === 'decisionId') {
    return 'Decision ID must be defined.';
  }

  if (id === 'resultVariable') {
    return 'Result variable must be defined.';
  }

  if (id === 'errorCode') {
    return 'Code must be defined.';
  }

  if (id === 'messageName') {
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

  if (id === 'taskDefinitionType' || id === 'timerEventDefinitionType') {
    return 'Type must be defined.';
  }

  if (id === 'messageSubscriptionCorrelationKey') {
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

  if (id === 'timerEventDefinitionDurationValue') {
    return data.type === ERROR_TYPES.EXPRESSION_REQUIRED ?
      'Duration must be defined.' : 'Must be an expression, or an ISO 8601 interval.';
  }

  if (id === 'timerEventDefinitionValue') {
    if (data.type === ERROR_TYPES.EXPRESSION_REQUIRED) {
      return 'Value must be defined.';
    }

    const { property } = data;

    if (property === 'timeCycle') {
      return 'Must be an expression, an ISO 8601 repeating interval, or a cron expression (cron requires Camunda Platform 8.1 or newer).';
    }

    if (property === 'timeDate') {
      return 'Must be an expression, or an ISO 8601 date.';
    }

    if (property === 'timeDuration') {
      return 'Must be an expression, or an ISO 8601 interval.';
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

function isPropertyDependendRequiredError(data, dependendRequiredProperty, type) {
  return data.type === ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED
    && data.dependendRequiredProperty === dependendRequiredProperty
    && (!type || is(data.node, type));
}

function isPropertyRequiredError(data, requiredProperty, type) {
  return data.type === ERROR_TYPES.PROPERTY_REQUIRED
    && (data.requiredProperty === requiredProperty)
    && (!type || is(data.node, type));
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

function getBusinessObject(element) {
  return element.businessObject || element;
}

function hasOnlyDurationTimer(node) {
  return is(node, 'bpmn:IntermediateCatchEvent') || isInterruptingBoundaryEvent(node);
}

function isInterruptingBoundaryEvent(event) {
  return is(event, 'bpmn:BoundaryEvent') && event.get('cancelActivity') !== false;
}
