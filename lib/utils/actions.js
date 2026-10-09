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
  return null;
}
