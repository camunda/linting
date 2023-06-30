import { groupBy } from 'min-dash';

import { domify } from 'min-dom';

const errorSvg = `
<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7Zm2.7 10.5L8 8.8l-2.7 2.7-.8-.8L7.2 8 4.5 5.3l.8-.8L8 7.2l2.7-2.7.8.8L8.8 8l2.7 2.7-.8.8Z" fill="var(--linting-annotation-error-fill-color, white)"/>
</svg>
`;

const warningSvg = `
<svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 3H4v10h8V3Z" fill="var(--linting-annotation-warning-stroke-color, black)"/>
  <path d="M8 1C4.15 1 1 4.15 1 8s3.15 7 7 7 7-3.15 7-7-3.15-7-7-7Zm-.55 3h1.1v5.5h-1.1V4ZM8 12.5c-.4 0-.75-.35-.75-.75S7.6 11 8 11s.75.35.75.75-.35.75-.75.75Z" fill="var(--linting-annotation-warning-fill-color, white)"/>
</svg>
`;

export default class LintingAnnotations {
  constructor(canvas, elementRegistry, eventBus, overlays) {
    this._canvas = canvas;
    this._elementRegistry = elementRegistry;
    this._eventBus = eventBus;
    this._overlays = overlays;

    this._reportsByElement = {};

    this._overlayIds = {};
  }

  setErrors(reports) {
    this._reportsByElement = groupBy(reports.filter(report => report.category !== 'rule-error'), 'id');

    this._update();
  }

  _update(reportsByElement) {
    if (!reportsByElement) {
      reportsByElement = this._reportsByElement;
    }

    this._overlays.remove({ type: 'linting' });

    Object.entries(reportsByElement).forEach(([ id, reports ]) => {
      const element = this._elementRegistry.get(id);

      if (!element || element === this._canvas.getRootElement()) {
        return;
      }

      const hasErrors = reports.find(({ category }) => category === 'error');

      const overlay = domify(`
        <div class="bjs-linting-annotation ${ hasErrors ? 'bjs-linting-annotation--error' : 'bjs-linting-annotation--warning' }" title="Click to show">
          ${ hasErrors ? errorSvg : warningSvg }
        </div>
      `);

      overlay.addEventListener('click', () => {
        this._eventBus.fire('lintingAnnotations.click', { report: reports[ 0 ] });
      });

      const overlayId = this._overlays.add(element, 'linting', {
        position: {
          bottom: -5,
          left: 0
        },
        html: overlay,
        show: {
          minZoom: 0.5
        }
      });

      this._overlayIds[ id ] = overlayId;
    });
  }
}

LintingAnnotations.$inject = [
  'canvas',
  'elementRegistry',
  'eventBus',
  'overlays'
];