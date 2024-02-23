const baseUrl = 'https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules';

export function getDocumentationUrl(rule) {
  if (rule === 'camunda-compat/called-element') {
    return getUrl('called-element');
  }

  if (rule === 'camunda-compat/element-type') {
    return getUrl('element-type');
  }

  if (rule === 'camunda-compat/error-reference') {
    return getUrl('error-reference');
  }

  if (rule === 'camunda-compat/escalation-reference') {
    return getUrl('escalation-reference');
  }

  if (rule === 'camunda-compat/feel') {
    return getUrl('feel');
  }

  if (rule === 'camunda-compat/message-reference') {
    return getUrl('message-reference');
  }

  if (rule === 'camunda-compat/history-time-to-live') {
    return getUrl('history-time-to-live');
  }

  return null;
}

function getUrl(rule) {
  return `${ baseUrl }/${ rule }`;
}