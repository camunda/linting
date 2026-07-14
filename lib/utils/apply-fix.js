/**
 * Apply a correction carried by a lint report to the model, through the host
 * modeler's own modeling module. Shared by Web Modeler and Desktop Modeler so
 * the correction behaves identically on every surface: neither reimplements
 * it, both call this from their own `modeling` instance.
 *
 * The fix payload is produced by the bpmnlint-plugin-camunda-compat agent
 * rules (`data.fix`); this function only applies it, it does not decide what
 * the fix is. A report with no applicable `data.fix` is a no-op.
 *
 * @param {Object} report - a lint report, optionally carrying `data.fix`
 * @param {Object} element - the diagram element the fix targets
 * @param {Object} modeling - the host bpmn-js `modeling` module
 * @param {Object} moddleElement - the moddle element the fix writes to
 *   (e.g. the `zeebe:Input` whose `source` is rewritten)
 */
export function applyFix(report, element, modeling, moddleElement) {
  const fix = report && report.data && report.data.fix;

  if (!fix || !fix.apply) {
    return;
  }

  const { apply } = fix;

  switch (apply.type) {
  case 'replace-source':
    modeling.updateModdleProperties(element, moddleElement, { source: apply.value });
    return;

  default:

    // Other apply types (set-output-target, set-result-variable, move-input)
    // are added as the correction stories that need them ship.
    return;
  }
}
