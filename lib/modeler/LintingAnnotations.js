import { groupBy } from 'min-dash';

import { domify } from 'min-dom';

import { renderOverlay } from './OverlayComponent';


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

      const html = domify(`
        <div class="bjs-linting-annotation"></div>
      `);

      renderOverlay(html, {
        reports,
        onClick: () => {
          this._eventBus.fire('lintingAnnotations.click', { report: reports[ 0 ] });
        }
      });

      const overlayId = this._overlays.add(element, 'linting', {
        position: {
          bottom: -5,
          left: 0
        },
        html,
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