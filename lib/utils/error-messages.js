import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/element';

import { is, isAny } from 'bpmnlint-utils';

import {
  every,
  isArray
} from 'min-dash';

import { getTypeString } from './types';

import {
  greaterOrEqual,
  toSemverMinor
} from './version';

const TIMER_PROPERTIES = [
  'timeCycle',
  'timeDate',
  'timeDuration'
];

const TIMER_PROPERTY_LABELS = {
  timeCycle: 'Cycle',
  timeDate: 'Date',
  timeDuration: 'Duration'
};

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
    && executionPlatformLabels[ executionPlatform ][ toSemverMinor(executionPlatformVersion) ];

  if (executionPlatformLabel) {
    return executionPlatformLabel;
  }

  if (executionPlatformLabels[ executionPlatform ]
    && executionPlatformLabels[ executionPlatform ][ 'default' ]) {
    executionPlatform = executionPlatformLabels[ executionPlatform ][ 'default' ];
  }

  return `${ executionPlatform } ${ toSemverMinor(executionPlatformVersion) }`;
}

function getIndefiniteArticle(type, uppercase = true) {
  if ([
    'Ad',
    'Error',
    'Escalation',
    'Event',
    'Inclusive',
    'Intermediate',
    'Undefined'
  ].includes(type.split(' ')[ 0 ])) {
    return uppercase ? 'An' : 'an';
  }

  return uppercase ? 'A' : 'a';
}

export function getErrorMessage(report, executionPlatform, executionPlatformVersion, modeler = 'desktop') {
  const {
    data,
    message
  } = report;

  if (!data) {
    return message;
  }

  const { type } = data;

  if (type === ERROR_TYPES.CHILD_ELEMENT_TYPE_NOT_ALLOWED) {
    return getChildElementTypeNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion);
  }

  if (type === ERROR_TYPES.ELEMENT_COLLAPSED_NOT_ALLOWED) {
    return getElementCollapsedNotAllowedErrorMessage(report);
  }

  if (type === ERROR_TYPES.ELEMENT_PROPERTY_VALUE_DUPLICATED) {
    return getElementPropertyValueDuplicatedErrorMessage(report);
  }

  if (type === ERROR_TYPES.ELEMENT_TYPE_NOT_ALLOWED) {
    return getElementTypeNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion);
  }

  if (type === ERROR_TYPES.EXTENSION_ELEMENT_NOT_ALLOWED) {
    return getExtensionElementNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion);
  }

  if (type === ERROR_TYPES.EXTENSION_ELEMENT_REQUIRED) {
    return getExtensionElementRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.PROPERTY_DEPENDENT_REQUIRED) {
    return getPropertyDependentRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.PROPERTY_NOT_ALLOWED) {
    return getPropertyNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion, modeler);
  }

  if (type === ERROR_TYPES.PROPERTY_REQUIRED) {
    return getPropertyRequiredErrorMessage(report, executionPlatform, executionPlatformVersion);
  }

  if (type === ERROR_TYPES.PROPERTY_VALUE_DUPLICATED) {
    return getPropertyValueDuplicatedErrorMessage(report);
  }

  if (type == ERROR_TYPES.PROPERTY_VALUE_NOT_ALLOWED) {
    return getPropertyValueNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion, modeler);
  }

  if (type === ERROR_TYPES.PROPERTY_VALUE_REQUIRED) {
    return getPropertyValueRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.EXPRESSION_REQUIRED) {
    return getExpressionRequiredErrorMessage(report);
  }

  if (type === ERROR_TYPES.EXPRESSION_VALUE_NOT_ALLOWED) {
    return getExpressionValueNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion);
  }

  if (type === ERROR_TYPES.EXPRESSION_NOT_ALLOWED) {
    return getExpressionNotAllowedErrorMessage(report);
  }

  if (type === ERROR_TYPES.EVENT_BASED_GATEWAY_TARGET_NOT_ALLOWED) {
    return getEventBasedGatewayTargetNotAllowedErrorMessage(report);
  }

  if (type === ERROR_TYPES.SECRET_EXPRESSION_FORMAT_DEPRECATED) {
    return getSecretExpressionFormatDeprecatedErrorMessage(report);
  }

  return message;
}

function getChildElementTypeNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion) {
  const { data } = report;

  const {
    allowedVersion,
    node,
    parent
  } = data;

  const typeString = getTypeString(node),
        parentTypeString = getTypeString(parent);

  return getSupportedMessage(
    `${ getIndefiniteArticle(typeString) } <${ typeString }> in ${ getIndefiniteArticle(parentTypeString, false) } <${ parentTypeString }>`,
    executionPlatform,
    executionPlatformVersion,
    allowedVersion
  );
}

function getElementCollapsedNotAllowedErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const { node } = data;

  const typeString = getTypeString(node);

  if (is(node, 'bpmn:SubProcess')) {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must be expanded`;
  }

  return message;
}

function getElementTypeNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion) {
  const { data } = report;

  const {
    allowedVersion,
    node
  } = data;

  const typeString = getTypeString(node);

  return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }>`, executionPlatform, executionPlatformVersion, allowedVersion);
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

function getPropertyValueRequiredErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const {
    node,
    property,
    parentNode
  } = data;

  if (is(node, 'bpmn:Process') && property === 'isExecutable') {
    if (parentNode && is(parentNode, 'bpmn:Participant')) {
      return 'One <Process> must be <Executable>';
    } else {
      return 'A <Process> must be <Executable>';
    }
  }

  return message;
}

function getExtensionElementNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion) {
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
    return getSupportedMessage('A <Business Rule Task> with <Implementation: DMN decision>', executionPlatform, executionPlatformVersion, allowedVersion);
  }

  if (is(extensionElement, 'zeebe:Properties')) {
    return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }> with <Extension properties>`, executionPlatform, executionPlatformVersion, allowedVersion);
  }

  if (is(node, 'bpmn:ScriptTask') && is(extensionElement, 'zeebe:Script')) {
    return getSupportedMessage('A <Script Task> with <Implementation: FEEL expression>', executionPlatform, executionPlatformVersion, allowedVersion);
  }

  if (is(node, 'bpmn:UserTask') && is(extensionElement, 'zeebe:TaskSchedule')) {
    return getSupportedMessage('A <User Task> with <Due date> or <Follow up date>', executionPlatform, executionPlatformVersion, allowedVersion);
  }

  if (is(node, 'bpmn:StartEvent') && is(extensionElement, 'zeebe:FormDefinition')) {
    return getSupportedMessage('A <Start Event> with <User Task Form>', executionPlatform, executionPlatformVersion, allowedVersion);
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

  if (isArray(requiredExtensionElement) && requiredExtensionElement.includes('zeebe:Script')) {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Implementation>`;
  }

  return message;
}

function getPropertyDependentRequiredErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const {
    node,
    parentNode,
    property,
    dependentRequiredProperty
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'zeebe:LoopCharacteristics') && property === 'outputCollection' && dependentRequiredProperty === 'outputElement') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>`;
  }

  if (is(node, 'zeebe:LoopCharacteristics') && property === 'outputElement' && dependentRequiredProperty === 'outputCollection') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>`;
  }

  return message;
}

function getPropertyNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion, modeler = 'desktop') {
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
      return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <Template ${ typeString }>`, executionPlatform, executionPlatformVersion, allowedVersion);
    } else if (modeler === 'web') {
      return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <Connector ${ typeString }>`, executionPlatform, executionPlatformVersion, allowedVersion);
    }
  }

  if (is(node, 'bpmn:InclusiveGateway') && property === 'incoming') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with more than one incoming <Sequence Flow> is not supported by ${ getExecutionPlatformLabel(executionPlatform, executionPlatformVersion) }`;
  }

  if (is(node, 'zeebe:AssignmentDefinition') && property === 'candidateUsers') {
    return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }> with defined <Candidate users>`, executionPlatform, executionPlatformVersion, allowedVersion);
  }

  if (is(node, 'bpmn:SequenceFlow') && property === 'conditionExpression') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Condition expression> is only supported if the source is an <Exclusive Gateway> or <Inclusive Gateway>`;
  }

  if (is(node, 'bpmn:TimerEventDefinition') && TIMER_PROPERTIES.includes(property)) {
    return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }> with <${ TIMER_PROPERTY_LABELS[ property ] }>`, executionPlatform, executionPlatformVersion, allowedVersion);
  }

  return message;
}


function getPropertyRequiredErrorMessage(report, executionPlatform, executionPlatformVersion) {
  const {
    data,
    message
  } = report;

  const {
    allowedVersion,
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

  if (parentNode && is(parentNode, 'bpmn:ScriptTask') && is(node, 'zeebe:Script') && requiredProperty === 'expression') {
    return 'A <Script Task> with <Implementation: FEEL expression> must have a defined <FEEL expression>';
  }

  if (parentNode && is(parentNode, 'bpmn:ScriptTask') && is(node, 'zeebe:Script') && requiredProperty === 'resultVariable') {
    return 'A <Script Task> with <Implementation: FEEL expression> must have a defined <Result variable>';
  }

  if (parentNode && isAny(parentNode, [ 'bpmn:BusinessRuleTask', 'bpmn:ScriptTask' ]) && is(node, 'zeebe:TaskDefinition') && requiredProperty === 'type') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Implementation: Job worker> must have a defined <Task definition type>`;
  }

  if (is(node, 'zeebe:CalledElement') && requiredProperty === 'processId') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Called element>`;
  }

  if (is(node, 'bpmn:Error') && requiredProperty === 'errorCode') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Error Reference> must have a defined <Error code>`;
  }

  if (is(node, 'bpmn:Escalation') && requiredProperty === 'escalationCode') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Escalation Reference> must have a defined <Escalation code>`;
  }

  if (is(node, 'zeebe:LoopCharacteristics') && requiredProperty === 'inputCollection') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Multi-instance marker> must have a defined <Input collection>`;
  }

  if (is(node, 'bpmn:Message') && requiredProperty === 'name') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Message Reference> must have a defined <Name>`;
  }

  if (is(node, 'bpmn:Signal') && requiredProperty === 'name') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Signal Reference> must have a defined <Name>`;
  }

  if (is(node, 'zeebe:Subscription') && requiredProperty === 'correlationKey') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Message Reference> must have a defined <Subscription correlation key>`;
  }

  if (is(node, 'zeebe:TaskDefinition') && requiredProperty === 'type') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> with <Implementation: Job worker> must have a defined <Task definition type>`;
  }

  if (requiredProperty === 'errorRef') {

    if (parentNode && is(parentNode, 'bpmn:CatchEvent')) {
      return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }> without defined <Error Reference>`, executionPlatform, executionPlatformVersion, allowedVersion);
    } else if (parentNode && is(parentNode, 'bpmn:ThrowEvent')) {
      return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Error Reference>`;
    }

  }

  if (requiredProperty === 'messageRef') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Message Reference>`;
  }

  if (requiredProperty === 'signalRef') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Signal Reference>`;
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

  if (is(node, 'bpmn:Process') && requiredProperty === 'historyTimeToLive') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <History time to live>`;
  }

  if (is(node, 'bpmn:LinkEventDefinition') && requiredProperty === 'name') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a defined <Name>`;
  }

  return message;
}

function getExpressionRequiredErrorMessage(report) {
  const {
    data,
    message
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

  return message;
}

function getExpressionValueNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion) {
  const {
    data,
    message
  } = report;

  const {
    node,
    parentNode,
    property
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'bpmn:FormalExpression') && property === 'timeCycle') {
    if (!greaterOrEqual(executionPlatformVersion, '8.1')) {
      return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Time cycle> must be an expression, an ISO 8601 repeating interval, or a cron expression (cron only supported by Camunda Platform 8.1 or newer)`;
    } else {
      return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Time cycle> must be an expression, an ISO 8601 repeating interval, or a cron expression`;
    }
  }

  if (is(node, 'bpmn:FormalExpression') && property === 'timeDate') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Time date> must be an expression, or an ISO 8601 date`;
  }

  if (is(node, 'bpmn:FormalExpression') && property === 'timeDuration') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Time duration> must be an expression, or an ISO 8601 interval`;
  }

  if (is(node, 'zeebe:TaskSchedule') && property === 'dueDate') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Due date> must be an ISO 8601 date`;
  }

  if (is(node, 'zeebe:TaskSchedule') && property === 'followUpDate') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> <Follow up date> must be an ISO 8601 date`;
  }

  return message;
}

function getSupportedMessage(prefix, executionPlatform, executionPlatformVersion, allowedVersion) {
  if (allowedVersion) {
    return `${ prefix } is only supported by ${ getExecutionPlatformLabel(executionPlatform, allowedVersion) } or newer`;
  }

  return `${ prefix } is not supported by ${ getExecutionPlatformLabel(executionPlatform, executionPlatformVersion) }`;
}

function getExpressionNotAllowedErrorMessage(report) {
  const {
    data
  } = report;

  const {
    node,
    parentNode,
    property
  } = data;

  if (is(node, 'bpmn:Escalation') && property === 'escalationCode' && is(parentNode, 'bpmn:CatchEvent')) {
    return 'Escalation code used in a catch event must be a static value';
  } else if (is(node, 'bpmn:Error') && property === 'errorCode' && is(parentNode, 'bpmn:CatchEvent')) {
    return 'Error code used in a catch event must be a static value';
  }

  return report.message;
}

function getEventBasedGatewayTargetNotAllowedErrorMessage(report) {
  const { data } = report;

  const { node } = data;

  if (is(node, 'bpmn:ReceiveTask')) {
    return 'A <Receive Task> cannot be the target of an <Event-Based Gateway>';
  }

  return report.message;
}

function getPropertyValueNotAllowedErrorMessage(report, executionPlatform, executionPlatformVersion, modeler = 'desktop') {
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

  if (is(node, 'zeebe:CalledElement') && property === 'propagateAllParentVariables') {
    return getSupportedMessage(`${ getIndefiniteArticle(typeString) } <${ typeString }> with <Propagate all variables> disabled`, executionPlatform, executionPlatformVersion, allowedVersion);
  }

  return message;
}

function getSecretExpressionFormatDeprecatedErrorMessage(report) {
  const { data } = report;

  const { property } = data;

  return `Property <${ property }> uses deprecated secret expression format secrets.SECRET, use {{secrets.SECRET}} instead`;
}

function getElementPropertyValueDuplicatedErrorMessage(report) {
  const {
    data,
    message
  } = report;

  const {
    node,
    parentNode,
    duplicatedProperty
  } = data;

  const typeString = getTypeString(parentNode || node);

  if (is(node, 'bpmn:LinkEventDefinition') && duplicatedProperty === 'name') {
    return `${ getIndefiniteArticle(typeString) } <${ typeString }> must have a unique <Name>`;
  }

  return message;
}