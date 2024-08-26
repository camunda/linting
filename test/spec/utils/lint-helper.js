import Linter from 'bpmnlint/lib/linter';

async function lintNode(node, rule, config = {}) {
  const linter = new Linter({
    resolver: {
      resolveRule: () => Promise.resolve(rule)
    }
  });

  const allReports = await linter.lint(node, {
    rules: { 'ruleName': [ 2, config ] }
  });

  Object.values(allReports).forEach(reports => {
    reports.forEach(report => {
      if (config.version) {
        report.executionPlatformVersion = config.version;
      }
    });
  });

  return allReports;
}

/**
 * Lint node with given rule and configuration expecting one report.
 *
 * @param {Object} node
 * @param {Function} rule
 * @param {Object} [config]
 *
 * @returns {Object}
 */
export async function getLintError(node, rule, config = {}) {
  const { ruleName } = await lintNode(node, rule, config);

  // assume
  expect(ruleName).to.exist;
  expect(ruleName).to.have.length(1);

  return ruleName[ 0 ];
}

/**
 * Lint node with given rule and configuration expecting one or more reports.
 *
 * @param {Object} node
 * @param {Function} rule
 * @param {Object} [config]
 *
 * @returns {Object}
 */
export async function getLintErrors(node, rule, config = {}) {
  const { ruleName } = await lintNode(node, rule, config);

  // assume
  expect(ruleName).to.exist;
  expect(ruleName).to.have.lengthOf.greaterThanOrEqual(1);

  return ruleName;
}