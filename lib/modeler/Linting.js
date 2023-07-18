import { getErrors } from '../utils/properties-panel';

export default class Linting {
  constructor(canvas, config, elementRegistry, eventBus, lintingAnnotations, selection) {
    this._canvas = canvas;
    this._elementRegistry = elementRegistry;
    this._eventBus = eventBus;
    this._lintingAnnotations = lintingAnnotations;
    this._selection = selection;

    this._active = config && config.active || false;
    this._reports = [];

    eventBus.on('selection.changed', () => this._update());

    eventBus.on('lintingAnnotations.click', ({ report }) => this.showError(report));
  }

  showError(report) {
    const {
      id,
      propertiesPanel = {}
    } = report;

    const element = this._elementRegistry.get(id);

    if (element !== this._canvas.getRootElement() && needsScrollToElement(this._canvas, element)) {
      this._canvas.scrollToElement(element);
    }

    if (element !== this._canvas.getRootElement()) {
      this._selection.select(element);
    } else {
      this._selection.select();
    }

    const { entryIds = [] } = propertiesPanel;

    // TODO(philippfromme): remove timeout once properties panel is fixed
    setTimeout(() => {
      this._eventBus.fire('propertiesPanel.showEntry', {
        id: entryIds[ Math.max(0, entryIds.length - 1) ]
      });
    });
  }

  setErrors(reports) {
    this._reports = reports;

    this._update();
  }

  activate() {
    this._active = true;

    this._update();
  }

  deactivate() {
    this._active = false;

    this._update();
  }

  isActive() {
    return this._active;
  }

  _update() {

    // set annotations
    this._lintingAnnotations.setErrors(this.isActive() ? this._reports : []);

    // set properties panel errors
    const selectedElement = this._getSelectedElement();

    this._eventBus.fire('propertiesPanel.setErrors', {
      errors: getErrors(this._reports, selectedElement)
    });
  }

  _getSelectedElement() {
    const selection = this._selection.get();

    if (!selection || !selection.length) {
      return this._canvas.getRootElement();
    }

    const selectedElement = selection[ 0 ];

    if (isLabel(selectedElement)) {
      return selectedElement.labelTarget;
    }

    return selectedElement;
  }
}

Linting.$inject = [
  'canvas',
  'config.linting',
  'elementRegistry',
  'eventBus',
  'lintingAnnotations',
  'selection'
];

function isLabel(element) {
  return !!element.labelTarget;
}

function needsScrollToElement(canvas, element) {
  const viewbox = canvas.viewbox();

  return viewbox.x > element.x
    || viewbox.y > element.y
    || viewbox.x + viewbox.width < element.x + element.width
    || viewbox.y + viewbox.height < element.y + element.height;
}