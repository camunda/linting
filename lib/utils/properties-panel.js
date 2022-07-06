import { isArray } from 'min-dash';

import { is } from 'bpmnlint-utils';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

export function getEntryId(report) {
  const {
    error = {}
  } = report;

  if (isExtensionElementRequiredError(error, 'zeebe:CalledDecision', 'bpmn:BusinessRuleTask')) {
    return 'businessRuleImplementation';
  }

  if (isPropertyRequiredError(error, 'errorRef')) {
    return 'errorRef';
  }

  if (isPropertyRequiredError(error, 'messageRef')) {
    return 'messageRef';
  }

  if (isPropertyRequiredError(error, 'decisionId', 'zeebe:CalledDecision')) {
    return 'decisionId';
  }

  if (isPropertyRequiredError(error, 'resultVariable', 'zeebe:CalledDecision')) {
    return 'resultVariable';
  }

  if (isPropertyRequiredError(error, 'errorCode', 'bpmn:Error')) {
    return 'errorCode';
  }

  if (isPropertyRequiredError(error, 'name', 'bpmn:Message')) {
    return 'messageName';
  }

  if (isExtensionElementRequiredError(error, 'zeebe:LoopCharacteristics', 'bpmn:MultiInstanceLoopCharacteristics')
    || isPropertyRequiredError(error, 'inputCollection', 'zeebe:LoopCharacteristics')) {
    return 'multiInstance-inputCollection';
  }

  if (isPropertyDependendRequiredError(error, 'outputCollection', 'zeebe:LoopCharacteristics')) {
    return 'multiInstance-outputCollection';
  }

  if (isPropertyDependendRequiredError(error, 'outputElement', 'zeebe:LoopCharacteristics')) {
    return 'multiInstance-outputElement';
  }

  if (isExtensionElementRequiredError(error, 'zeebe:CalledElement', 'bpmn:CallActivity')
    || isPropertyRequiredError(error, 'processId', 'zeebe:CalledElement')) {
    return 'targetProcessId';
  }

  if (isExtensionElementRequiredError(error, 'zeebe:TaskDefinition')
    || isPropertyRequiredError(error, 'type', 'zeebe:TaskDefinition')) {
    return 'taskDefinitionType';
  }

  if (isExtensionElementRequiredError(error, 'zeebe:Subscription')
    || isPropertyRequiredError(error, 'correlationKey', 'zeebe:Subscription')) {
    return 'messageSubscriptionCorrelationKey';
  }

  if (isPropertyRequiredError(error, 'formKey', 'zeebe:FormDefinition')) {
    return 'customFormKey';
  }

  if (isPropertyRequiredError(error, 'body', 'zeebe:UserTaskForm')) {
    return 'formConfiguration';
  }

  return null;
}

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

    const id = getEntryId(report);

    if (!id) {
      return errors;
    }

    let { message } = report;

    message = getErrorMessage(id) || message;

    return {
      ...errors,
      [ id ]: message
    };
  }, {});
}

export function getErrorMessage(id) {
  if (id === 'businessRuleTaskImplementation') {
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

  if (id === 'taskDefinitionType') {
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
}

function isExtensionElementRequiredError(error, requiredExtensionElement, type) {
  return error.type === ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED
    && (isArray(error.requiredExtensionElement) && error.requiredExtensionElement.includes(requiredExtensionElement)
      || error.requiredExtensionElement === requiredExtensionElement)
    && (!type || is(error.node, type));
}

function isPropertyDependendRequiredError(error, dependendRequiredProperty, type) {
  return error.type === ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED
    && error.dependendRequiredProperty === dependendRequiredProperty
    && (!type || is(error.node, type));
}

function isPropertyRequiredError(error, requiredProperty, type) {
  return error.type === ERROR_TYPES.PROPERTY_REQUIRED
    && error.requiredProperty === requiredProperty
    && (!type || is(error.node, type));
}

function getBusinessObject(element) {
  return element.businessObject || element;
}