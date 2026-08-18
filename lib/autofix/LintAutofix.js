import { domify } from 'min-dom';

import { renderFixButton } from './FixButtonComponent';

import {
  applyFix,
  canApplyFix,
  getFixLabel,
  hasFix
} from '../utils/apply-fix';

const OVERLAY_TYPE = 'lint-autofix';

/**
 * General render module for lint autofixes. For any lint report that carries a
 * safe `data.fix`, it shows a Fix control on the target element and applies the
 * fix (as a command list from `@camunda/linting`'s applyFix) in one undo unit.
 *
 * It is not agent-specific: it keys off `hasFix`, so any rule that carries a
 * fix payload gets a Fix control for free.
 */
export default class LintAutofix {
  constructor(canvas, commandStack, elementRegistry, eventBus, overlays) {
    this._canvas = canvas;
    this._commandStack = commandStack;
    this._elementRegistry = elementRegistry;
    this._eventBus = eventBus;
    this._overlays = overlays;

    this._reports = [];

    eventBus.on('linting.reportsChanged', ({ reports }) => {
      this._reports = reports || [];

      this._update();
    });

    // reposition/clear when the diagram is re-rendered
    eventBus.on([ 'import.done', 'diagram.clear' ], () => this._update());
  }

  _update() {
    this._overlays.remove({ type: OVERLAY_TYPE });

    const rootElement = this._canvas.getRootElement();

    const fixableByElement = {};

    for (const report of this._reports) {
      if (!hasFix(report)) {
        continue;
      }

      // one Fix control per element; the first fixable report wins for now
      if (!fixableByElement[ report.id ]) {
        fixableByElement[ report.id ] = report;
      }
    }

    Object.entries(fixableByElement).forEach(([ id, report ]) => {
      const element = this._elementRegistry.get(id);

      if (!element || element === rootElement) {
        return;
      }

      const container = domify('<div class="cl-autofix-root"></div>');

      renderFixButton(container, {
        label: getFixLabel(report),
        disabled: !canApplyFix(report, element),
        onClick: () => this._applyFix(report, element)
      });

      this._overlays.add(element, OVERLAY_TYPE, {
        position: { bottom: -34, left: 0 },
        html: container,
        scale: { min: .7 }
      });
    });
  }

  _applyFix(report, element) {
    const commands = applyFix({ report, element });

    if (!commands.length) {
      return;
    }

    // one click is one undo unit; multi-command-executor batches multi-element
    // fixes atomically and is present wherever the properties panel is.
    try {
      this._commandStack.execute('properties-panel.multi-command-executor', commands);
    } catch (e) {
      commands.forEach(({ cmd, context }) => this._commandStack.execute(cmd, context));
    }
  }
}

LintAutofix.$inject = [
  'canvas',
  'commandStack',
  'elementRegistry',
  'eventBus',
  'overlays'
];
