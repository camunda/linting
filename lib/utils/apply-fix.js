import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

/**
 * Resolve a report's moddle path (relative to the element's business object) to
 * the moddle element that owns the property to change and the property name
 * (the last path segment).
 *
 * @param {Object} element
 * @param {Array<string|number>} path
 *
 * @returns {{ moddleElement: Object, property: string }|null}
 */
function resolveTarget(element, path) {
  if (!path || !path.length) {
    return null;
  }

  let current = getBusinessObject(element);

  for (const segment of path.slice(0, -1)) {
    if (!current) {
      return null;
    }

    current = typeof segment === 'number'
      ? current[ segment ]
      : (typeof current.get === 'function' ? current.get(segment) : current[ segment ]);
  }

  if (!current) {
    return null;
  }

  return { moddleElement: current, property: path[ path.length - 1 ] };
}

/**
 * Turn a report's machine-readable fix (`data.fix`, produced by the
 * bpmnlint-plugin-camunda-compat agent rules) into a command list the host
 * executes as one undo unit. This function applies the fix; it does not decide
 * what the fix is. Returns [] when there is nothing safe to apply, so a stale
 * offer degrades to a no-op instead of a partial edit.
 *
 * @param {Object} options
 * @param {Object} options.report - a lint report, optionally carrying `data.fix`
 * @param {Object} options.element - the diagram element the fix targets
 *
 * @returns {Array<{ cmd: string, context: Object }>}
 */
export function applyFix({ report, element }) {
  const fix = report && report.data && report.data.fix;

  if (!fix || !fix.apply) {
    return [];
  }

  const { apply } = fix;

  switch (apply.type) {
  case 'replace-source': {
    const target = resolveTarget(element, report.path);

    if (!target) {
      return [];
    }

    return [ {
      cmd: 'element.updateModdleProperties',
      context: {
        element,
        moddleElement: target.moddleElement,
        properties: { [ target.property ]: apply.value }
      }
    } ];
  }

  default:

    // Other apply types (set-property, move-input, set-property-on) are added
    // as the correction stories that need them ship.
    return [];
  }
}

/**
 * Whether a report carries a fix safe enough to offer as a one-click apply.
 * Gates strictly on 'safe' confidence; lower confidence routes to guidance.
 *
 * @param {Object} report
 *
 * @returns {boolean}
 */
export function hasFix(report) {
  const fix = report && report.data && report.data.fix;

  return Boolean(fix && fix.apply && fix.confidence === 'safe');
}

const FIX_LABELS = {
  [ ERROR_TYPES.AGENT_FEEL_FUNCTION_NAME_INVALID ]: 'Fix',
  [ ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID ]: 'Fix',
  [ ERROR_TYPES.AGENT_FEEL_KEY_PREFIX_MISSING ]: 'Fix',
  [ ERROR_TYPES.AGENT_FEEL_KEY_SEGMENTS_INVALID ]: 'Fix',
  [ ERROR_TYPES.AGENT_FEEL_KEY_TYPE_INVALID ]: 'Fix'
};

/**
 * User-facing label for the Fix control. Kept out of the rule payload so copy
 * stays in one place and stays localizable.
 *
 * @param {Object} report
 *
 * @returns {string}
 */
export function getFixLabel(report) {
  const kind = report && report.data && report.data.fix && report.data.fix.kind;

  if (kind === 'autofill') {
    return 'Autofill';
  }

  const type = report && report.data && report.data.type;

  return FIX_LABELS[ type ] || 'Fix';
}

/**
 * Whether a fix can currently be applied to the element. Evaluated at offer
 * time so the host can grey the control; false means apply would be a no-op
 * against the live model.
 *
 * @param {Object} report
 * @param {Object} element
 *
 * @returns {boolean}
 */
export function canApplyFix(report, element) {
  return applyFix({ report, element }).length > 0;
}
