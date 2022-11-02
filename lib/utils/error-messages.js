import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/element';

import { is } from 'bpmnlint-utils';

import {
  every,
  isArray
} from 'min-dash';

import { getTypeString } from './types';

const TIMER_PROPERTIES = [
  'timeCycle',
  'timeDate',
  'timeDuration'
];

const executionPlatformLabels = {
  'Camunda Cloud': {
    'default': 'Camunda',
    '1.0': 'Camunda 8 (Zeebe 1.0)',
    '1.1': 'Camunda 8 (Zeebe 1.1)',
    '1.2': 'Camunda 8 (Zeebe 1.2)',
    '1.3': 'Camunda 8 (Zeebe 1.3)'
  }
};

export function getExecutionPlatformLabel(executionPlatform, executionPlatformVersion) {
  const executionPlatformLabel = executionPlatformLabels[ executionPlatform ]
    && executionPlatformLabels[ executionPlatform ][ executionPlatformVersion ];

  if (executionPlatformLabel) {
    return executionPlatformLabel;
  }

  if (executionPlatformLabels[ executionPlatform ]
    && executionPlatformLabels[ executionPlatform ][ 'default' ]) {
    executionPlatform = executionPlatformLabels[ executionPlatform ][ 'default' ];
  }

  return `${ executionPlatform } ${ executionPlatformVersion }`;
}

function getIndefiniteArticle(type) {
  if ([
    'Error',
    'Escalation',
    'Event',
    'Inclusive',
    'Intermediate',
    'Undefined'
  ].includes(type.split(' ')[ 0 ])) {
    return 'An';
  }

  return 'A';
}

export function getErrorMessage(report, executionPlatformVersion, modeler = 'desktop') {
  const {
    data,
    message
  } = report;

  if (!data) {
    return message;
  }

  const { type } = data;

  if (type === ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED) {
    return getElementTypeNotAllowedErrorMessage(report, executionPlatformVersion);
  }

  if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
    return getExtensionElementNotAllowedErrorMessage(report, executionPlatformVersion);
  }

  if (type === ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED) {
    return getExtensionElementRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.PROPERTY_DEPENDEND_REQUIRED) {
    return getPropertyDependendRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getPropertyNotAllowedErrorMessage(report, executionPlatformVersion, modeler);
  }

  if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return getPropertyRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.PROPERTY_VALUE_DUPLICATED) {
    return getPropertyValueDuplicatedErrorMessage(report);
  }

  if (type === ERROR_TYPES.EXPRESSION_REQUIRED) {
    return getExpressionRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED) {
    return getExpressionValueNotAllowedErrorMessage(report);
  }

  return message;
}

function getElementTypeNotAllowedErrorMessage(report, executionPlatformVersion) {
  const { data } = report;

  const {
    allowedVersion,
    node
  } = data;

  const typeString = getTypeString(node);

  return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }>`, executionPlatformVersion, allowedVersion);
}

function getPropertyValueDuplicatedErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const {
    node,
    parentNode,
    duplicatedPropertyValue,
    properties
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'zeebe:TaskHeaders') && every(properties, property => is(property, 'zeebe:Header'))) {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with two or more <Headers> with the same <Key> (${ duplicatedPropertyValue }) is not supported`;
  }

  return message;
}

function getExtensionElementNotAllowedErrorMessage(report, executionPlatformVersion) {
  const {
    data,
    message
  } = report;

  const {
    allowedVersion,
    node,
    parentNode,
    extensionElement
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'bpmn:BusinessRuleTask') && is(extensionElement, 'zeebe:CalledDecision')) {
    return getSupportedMessage('A <Business Rule Task> with <Implementation: DMN decision>', executionPlatformVersion, allowedVersion);
  }

  if (is(extensionElement, 'zeebe:Properties')) {
    return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }> with <Extension properties>`, executionPlatformVersion, allowedVersion);
  }

  return message;
}

function getExtensionElementRequiredErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const {
    node,
    parentNode,
    requiredExtensionElement
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (requiredExtensionElement === 'zeebe:CalledElement') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Called element>`;
  }

  if (requiredExtensionElement === 'zeebe:LoopCharacteristics') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Multi-instance marker> must have a defined <Input collection>`;
  }

  if (requiredExtensionElement === 'zeebe:Subscription') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Message Reference> must have a defined <Subscription correlation key>`;
  }

  if (requiredExtensionElement === 'zeebe:TaskDefinition') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a <Task definition type>`;
  }

  if (isArray(requiredExtensionElement) && requiredExtensionElement.includes('zeebe:CalledDecision')) {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Implementation>`;
  }

  return message;
}

function getPropertyDependendRequiredErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const {
    node,
    parentNode,
    property,
    dependendRequiredProperty
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'zeebe:LoopCharacteristics') && property === 'outputCollection' && dependendRequiredProperty === 'outputElement') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>`;
  }

  if (is(node, 'zeebe:LoopCharacteristics') && property === 'outputElement' && dependendRequiredProperty === 'outputCollection') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>`;
  }

  return message;
}

function getPropertyNotAllowedErrorMessage(report, executionPlatformVersion, modeler = 'desktop') {
  const {
    data,
    message
  } = report;

  const {
    allowedVersion,
    node,
    parentNode,
    property
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (property === 'modelerTemplate') {
    if (modeler === 'desktop') {
      return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <Template ${ typeString }>`, executionPlatformVersion, allowedVersion);
    } else if (modeler === 'web') {
      return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <Connector ${ typeString }>`, executionPlatformVersion, allowedVersion);
    }
  }

  if (is(node, 'bpmn:InclusiveGateway') && property === 'incoming') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with more than one incoming <Sequence Flow> is not supported by ${ getExecutionPlatformLabel('Camunda Cloud', executionPlatformVersion) }`;
  }

  return message;
}


function getPropertyRequiredErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const {
    node,
    parentNode,
    requiredProperty
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (parentNode && is(parentNode, 'bpmn:BusinessRuleTask') && is(node, 'zeebe:CalledDecision') && requiredProperty === 'decisionId') {
    return 'A <Business Rule Task> with <Implementation: DMN decision> must have a defined <Called decision ID>';
  }

  if (parentNode && is(parentNode, 'bpmn:BusinessRuleTask') && is(node, 'zeebe:CalledDecision') && requiredProperty === 'resultVariable') {
    return 'A <Business Rule Task> with <Implementation: DMN decision> must have a defined <Result variable>';
  }

  if (parentNode && is(parentNode, 'bpmn:BusinessRuleTask') && is(node, 'zeebe:TaskDefinition') && requiredProperty === 'type') {
    return 'A <Business Rule Task> with <Implementation: Job worker> must have a defined <Task definition type>';
  }

  if (is(node, 'zeebe:CalledElement') && requiredProperty === 'processId') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Called element>`;
  }

  if (is(node, 'bpmn:Error') && requiredProperty === 'errorCode') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Error Reference> must have a defined <Error code>`;
  }

  if (is(node, 'zeebe:LoopCharacteristics') && requiredProperty === 'inputCollection') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Multi-instance marker> must have a defined <Input collection>`;
  }

  if (is(node, 'bpmn:Message') && requiredProperty === 'name') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Message Reference> must have a defined <Name>`;
  }

  if (is(node, 'zeebe:Subscription') && requiredProperty === 'correlationKey') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Message Reference> must have a defined <Subscription correlation key>`;
  }

  if (is(node, 'zeebe:TaskDefinition') && requiredProperty === 'type') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Implementation: Job worker> must have a defined <Task definition type>`;
  }

  if (requiredProperty === 'errorRef') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Error Reference>`;
  }

  if (requiredProperty === 'messageRef') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Message Reference>`;
  }

  if (is(node, 'zeebe:FormDefinition') && requiredProperty === 'formKey') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Form type: Custom form key> must have a defined <Form key>`;
  }

  if (is(node, 'zeebe:UserTaskForm') && requiredProperty === 'body') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Form type: Camunda forms> must have a defined <Form JSON configuration>`;
  }

  if (is(node, 'bpmn:SequenceFlow') && requiredProperty === 'conditionExpression') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Condition expression> or be the default <Sequence Flow>`;
  }

  if (is(node, 'bpmn:TimerEventDefinition')
    && isArray(requiredProperty)
    && TIMER_PROPERTIES.some(property => requiredProperty.includes(property))
  ) {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Timer type>`;
  }

  if (is(node, 'bpmn:TimerEventDefinition') && requiredProperty === 'timeDuration') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Timer duration>`;
  }

  return message;
}

function getExpressionRequiredErrorMessage(report) {
  const {
    data
  } = report;

  const {
    node,
    parentNode,
    property
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'bpmn:FormalExpression') && TIMER_PROPERTIES.includes(property)) {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Timer value>`;
  }
}

function getExpressionValueNotAllowedErrorMessage(report) {
  const {
    data
  } = report;

  const {
    node,
    parentNode,
    property
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'bpmn:FormalExpression') && property === 'timeCycle') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Time cycle> should be an expression, an ISO 8601 repeating interval, or a cron expression (cron requires Camunda Platform 8.1 or newer)`;
  }

  if (is(node, 'bpmn:FormalExpression') && property === 'timeDate') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Time date> should be an expression, or an ISO 8601 date`;
  }

  if (is(node, 'bpmn:FormalExpression') && property === 'timeDuration') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Time duration> should be an expression, or an ISO 8601 interval`;
  }
}

function getSupportedMessage(prefix, executionPlatformVersion, allowedVersion) {
  if (allowedVersion) {
    return `${ prefix } is only supported by ${ getExecutionPlatformLabel('Camunda Cloud', allowedVersion) } or newer`;
  }

  return `${ prefix } is not supported by ${ getExecutionPlatformLabel('Camunda Cloud', executionPlatformVersion) }`;
}