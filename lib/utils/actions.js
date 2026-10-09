import { isNumber } from 'min-dash';

import { is } from 'bpmnlint-utils';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

/**
 * @typedef { {
 *   element: Object,
 *   businessObject: Object,
 *   report: Object,
 *   injector: Object
 * } } LintActionContext
 *
 * @typedef { {
 *   label: string,
 *   execute: (context: LintActionContext) => void
 * } } LintAction
 */

/**
 * Get the action that fixes a report, if any. It is applied to the live model
 * through `Linting#applyAction`.
 *
 * @param {Object} report
 *
 * @returns {LintAction|null}
 */
export function getAction(report) {
  const { data } = report;

  if (!data) {
    return null;
  }

  const { type } = data;

  if (type === ERROR_TYPES.PROPERTY_VALUE_REQUIRED) {
    return getPropertyValueRequiredAction(report);
  }

  return null;
}

function getPropertyValueRequiredAction(report) {
  const {
    node,
    property
  } = report.data;

  if (is(node, 'bpmn:Process') && property === 'isExecutable') {
    return getSetRequiredValueAction(report, 'Make executable');
  }

  if (is(node, 'bpmn:CompensateEventDefinition') && property === 'waitForCompletion') {
    return getSetRequiredValueAction(report, 'Set "Wait for completion"');
  }

  return null;
}

function getSetRequiredValueAction(report, label) {
  const {
    property,
    requiredValue
  } = report.data;

  const targetPath = getTargetPath(report);

  return {
    label,
    execute({ element, businessObject, injector }) {
      injector.get('modeling').updateModdleProperties(element, getByPath(businessObject, targetPath), {
        [ property ]: requiredValue
      });
    }
  };
}

/**
 * Get the path from the reported business object to the moddle element that
 * holds the reported property.
 */
function getTargetPath(report) {
  const {
    data: { node, parentNode },
    path
  } = report;

  // the process of a participant is reported on the participant, but its
  // path is rooted at the definitions
  if (parentNode && is(parentNode, 'bpmn:Participant') && parentNode.get('processRef') === node) {
    return [ 'processRef' ];
  }

  return path.slice(0, -1);
}

function getByPath(moddleElement, path) {
  return path.reduce((node, segment) => isNumber(segment) ? node[ segment ] : node.get(segment), moddleElement);
}
