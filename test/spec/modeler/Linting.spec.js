import {
  bootstrapModeler,
  inject,
  insertCSS
} from 'bpmn-js/test/helper';

import sinon from 'sinon';

import { Linter } from '../../..';

import lintingModule from '../../../modeler';

import { getErrors } from '../../../lib/utils/properties-panel';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';
import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFont from  'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import lintingCSS from '../../../assets/linting.css';

import diagramXML from './linting.bpmn';

insertCSS('diagram-js.css', diagramCSS);
insertCSS('bpmn-js.css', bpmnCSS);
insertCSS('bpmn-embedded.css', bpmnFont);
insertCSS('linting.css', lintingCSS);

const singleStart = window.__env__ && window.__env__.SINGLE_START;

const linter = new Linter();

describe('Linting', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      lintingModule
    ]
  }));


  (singleStart ? it.only : it)('example', inject(function(bpmnjs, linting) {
    linting.setErrors([
      {
        id: 'StartEvent_1',
        message: 'foo'
      }
    ]);

    linting.activate();

    const button = document.createElement('button');

    button.style.position = 'absolute';
    button.style.top = '20px';
    button.style.right = '20px';

    button.textContent = 'Toggle Linting';

    let lintingActive = true;

    button.addEventListener('click', () => {
      if (lintingActive) {
        linting.deactivate();
      } else {
        linting.activate();
      }

      lintingActive = !lintingActive;
    });

    bpmnjs._container.appendChild(button);
  }));


  it('should not be active by default', inject(function(linting) {

    // then
    expect(linting.isActive()).to.be.false;
  }));


  describe('config', function() {

    beforeEach(bootstrapModeler(diagramXML, {
      additionalModules: [
        lintingModule
      ],
      linting: {
        active: true
      }
    }));


    it('should be active if configured', inject(function(linting) {

      // then
      expect(linting.isActive()).to.be.true;
    }));

  });


  it('should activate', inject(
    async function(bpmnjs, elementRegistry, eventBus, linting, lintingAnnotations, overlays, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      selection.select(serviceTask);

      const reports = await linter.lint(bpmnjs.getDefinitions());

      // assume
      expect(reports).to.have.length(1);
      expect(getErrors(reports, serviceTask)).not.to.be.empty;

      linting.setErrors(reports);

      const setErrorsSpy = sinon.spy(lintingAnnotations, 'setErrors');

      const propertiesPanelSetErrorSpy = sinon.spy();

      eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

      // when
      linting.activate();

      // then
      expect(setErrorsSpy).to.have.been.calledOnce;
      expect(setErrorsSpy).to.have.been.calledWithMatch(reports);

      expect(propertiesPanelSetErrorSpy).to.have.been.calledOnce;
      expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
        errors: getErrors(reports, serviceTask)
      });

      expect(overlays.get({ type: 'linting' })).to.have.length(1);
    }
  ));


  it('should deactivate', inject(
    async function(bpmnjs, elementRegistry, eventBus, linting, lintingAnnotations, overlays, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      selection.select(serviceTask);

      const reports = await linter.lint(bpmnjs.getDefinitions());

      // assume
      expect(reports).to.have.length(1);
      expect(getErrors(reports, serviceTask)).not.to.be.empty;

      linting.setErrors(reports);

      linting.activate();

      // assume
      expect(overlays.get({ type: 'linting' })).to.have.length(1);

      const setErrorsSpy = sinon.spy(lintingAnnotations, 'setErrors');

      const propertiesPanelSetErrorSpy = sinon.spy();

      eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

      // when
      linting.deactivate();

      // then
      expect(setErrorsSpy).to.have.been.calledOnce;
      expect(setErrorsSpy).to.have.been.calledWithMatch([]);

      expect(propertiesPanelSetErrorSpy).to.have.been.calledOnce;
      expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
        errors: getErrors(reports, serviceTask)
      });

      expect(overlays.get({ type: 'linting' })).to.have.length(0);
    }
  ));


  it('should update linting annotations on selection.changed (active)', inject(
    async function(bpmnjs, elementRegistry, eventBus, linting, lintingAnnotations, overlays, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      const reports = await linter.lint(bpmnjs.getDefinitions());

      // assume
      expect(reports).to.have.length(1);

      linting.setErrors(reports);

      linting.activate();

      const setErrorsSpy = sinon.spy(lintingAnnotations, 'setErrors');

      const propertiesPanelSetErrorSpy = sinon.spy();

      eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

      // when
      selection.select(serviceTask);

      // then
      expect(setErrorsSpy).to.have.been.calledOnce;
      expect(setErrorsSpy).to.have.been.calledWithMatch(reports);

      expect(propertiesPanelSetErrorSpy).to.have.been.calledOnce;
      expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
        errors: getErrors(reports, serviceTask)
      });

      expect(overlays.get({ type: 'linting' })).to.have.length(1);
    }
  ));


  it('should not update linting annotations on selection.changed (not active)', inject(
    async function(bpmnjs, elementRegistry, eventBus, linting, lintingAnnotations, overlays, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      const reports = await linter.lint(bpmnjs.getDefinitions());

      // assume
      expect(reports).to.have.length(1);

      linting.setErrors(reports);

      linting.deactivate();

      const setErrorsSpy = sinon.spy(lintingAnnotations, 'setErrors');

      const propertiesPanelSetErrorSpy = sinon.spy();

      eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

      // when
      selection.select(serviceTask);

      // then
      expect(setErrorsSpy).to.have.been.calledOnce;
      expect(setErrorsSpy).to.have.been.calledWithMatch([]);

      expect(propertiesPanelSetErrorSpy).to.have.been.calledOnce;
      expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
        errors: getErrors(reports, serviceTask)
      });

      expect(overlays.get({ type: 'linting' })).to.have.length(0);
    }
  ));


  it('should show error', inject(
    async function(bpmnjs, elementRegistry, eventBus, linting, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      const reports = await linter.lint(bpmnjs.getDefinitions());

      // assume
      expect(reports).to.have.length(1);

      linting.setErrors(reports);

      linting.activate();

      const propertiesPanelSetErrorSpy = sinon.spy();

      eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

      const propertiesPanelShowEntrySpy = sinon.spy();

      eventBus.on('propertiesPanel.showEntry', propertiesPanelShowEntrySpy);

      // when
      linting.showError(reports[ 0 ]);

      // then
      expect(selection.get()).to.eql([ serviceTask ]);

      expect(propertiesPanelSetErrorSpy).to.have.been.calledOnce;
      expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
        errors: getErrors(reports, serviceTask)
      });

      expect(propertiesPanelShowEntrySpy).to.have.been.calledOnce;
      expect(propertiesPanelShowEntrySpy).to.have.been.calledWithMatch({
        id: 'taskDefinitionType'
      });
    }
  ));


  it('should show error on lintingAnnotations.click', inject(
    async function(bpmnjs, elementRegistry, eventBus, linting, selection) {

      // given
      const serviceTask = elementRegistry.get('ServiceTask_1');

      const reports = await linter.lint(bpmnjs.getDefinitions());

      // assume
      expect(reports).to.have.length(1);

      linting.setErrors(reports);

      linting.activate();

      const propertiesPanelSetErrorSpy = sinon.spy();

      eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

      const propertiesPanelShowEntrySpy = sinon.spy();

      eventBus.on('propertiesPanel.showEntry', propertiesPanelShowEntrySpy);

      // when
      eventBus.fire('lintingAnnotations.click', { report: reports[ 0 ] });

      // then
      expect(selection.get()).to.eql([ serviceTask ]);

      expect(propertiesPanelSetErrorSpy).to.have.been.calledOnce;
      expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
        errors: getErrors(reports, serviceTask)
      });

      expect(propertiesPanelShowEntrySpy).to.have.been.calledOnce;
      expect(propertiesPanelShowEntrySpy).to.have.been.calledWithMatch({
        id: 'taskDefinitionType'
      });
    }
  ));


  describe('canvas scrolling', function() {

    it('should scroll', inject(
      function(canvas, linting) {

        // given
        const reports = [
          {
            id: 'StartEvent_1',
            message: 'foo'
          }
        ];

        linting.setErrors(reports);

        linting.activate();

        canvas.viewbox({
          x: 10000,
          y: 10000,
          width: 1000,
          height: 1000
        });

        const scrollToElementSpy = sinon.spy(canvas, 'scrollToElement');

        // when
        linting.showError(reports[ 0 ]);

        // then
        expect(scrollToElementSpy).to.have.been.called;
      }
    ));


    it('should not scroll', inject(
      function(canvas, linting) {

        // given
        const reports = [
          {
            id: 'StartEvent_1',
            message: 'foo'
          }
        ];

        linting.setErrors(reports);

        linting.activate();

        canvas.viewbox({
          x: 0,
          y: 0,
          width: 1000,
          height: 1000
        });

        const scrollToElementSpy = sinon.spy(canvas, 'scrollToElement');

        // when
        linting.showError(reports[ 0 ]);

        // then
        expect(scrollToElementSpy).not.to.have.been.called;
      }
    ));

  });

});