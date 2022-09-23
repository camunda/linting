import {
  bootstrapModeler,
  inject,
  insertCSS
} from 'bpmn-js/test/helper';

import zeebeModdleExtension from 'zeebe-bpmn-moddle/resources/zeebe';
import modelerModdleExtension from 'modeler-moddle/resources/modeler';

import {
  BpmnPropertiesPanelModule as propertiesPanelModule,
  BpmnPropertiesProviderModule as bpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule as zeebePropertiesProviderModule,
  CloudElementTemplatesPropertiesProviderModule as cloudElementTemplatesPropertiesProvider
} from 'bpmn-js-properties-panel';

import { domify } from 'min-dom';

import sinon from 'sinon';

import { Linter } from '../../..';

import lintingModule from '../../../modeler';

import { getErrors } from '../../../lib/utils/properties-panel';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';
import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFont from  'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import propertiesPanelCSS from 'bpmn-js-properties-panel/dist/assets/properties-panel.css';
import elementTemplatesCSS from 'bpmn-js-properties-panel/dist/assets/element-templates.css';
import lintingCSS from '../../../assets/linting.css';

import diagramXML from './linting.bpmn';

insertCSS('diagram-js.css', diagramCSS);
insertCSS('bpmn-js.css', bpmnCSS);
insertCSS('bpmn-embedded.css', bpmnFont);
insertCSS('properties-panel.css', propertiesPanelCSS);
insertCSS('element-templates.css', elementTemplatesCSS);
insertCSS('linting.css', lintingCSS);

insertCSS('test.css', `
  .test-container {
    display: flex;
    flex-direction: column;
  }

  .properties-panel-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 250px;
    height: 100%;
    border-left: solid 1px #ccc;
    background-color: #f7f7f8;
  }

  .panel {
    position: absolute;
    bottom: 0;
    left: 0;
    width: calc(100% - 250px - 1px);
    height: 200px;
    display: flex;
    flex-direction: column;
    background-color: #f7f7f8;
    padding: 5px;
    box-sizing: border-box;
    border-top: solid 1px #ccc;
    font-family: sans-serif;
  }

  .panel textarea {
    resize: none;
    flex-grow: 1;
    background-color: #f7f7f8;
    border: none;
    margin-bottom: 5px;
    font-family: sans-serif;
    line-height: 1.5;
    outline: none;
  }

  .panel button,
  .panel input {
    width: 200px;
  }
`);


const singleStart = window.__env__ && window.__env__.SINGLE_START;

const linter = new Linter();

describe('Linting', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      lintingModule,
      propertiesPanelModule,
      bpmnPropertiesProviderModule,
      zeebePropertiesProviderModule,
      cloudElementTemplatesPropertiesProvider
    ],
    moddleExtensions: {
      modeler: modelerModdleExtension,
      zeebe: zeebeModdleExtension
    }
  }));


  (singleStart ? it.only : it.skip)('example', inject(function(bpmnjs, canvas, eventBus, linting, modeling, propertiesPanel) {

    // given
    const linter = new Linter();

    const lint = () => {
      const definitions = bpmnjs.getDefinitions();

      linter.lint(definitions).then(reports => {
        console.log('reports', reports);

        linting.setErrors(reports);

        panel.querySelector('textarea').textContent = reports.map(({ message }) => message).join('\n');
      });
    };

    lint();

    eventBus.on('elements.changed', lint);

    linting.activate();

    const propertiesPanelParent = domify('<div class="properties-panel-container"></div>');

    bpmnjs._container.appendChild(propertiesPanelParent);

    propertiesPanel.attachTo(propertiesPanelParent);

    const panel = domify(`
      <div class="panel">
        <textarea></textarea>
        <div>
          <label>Execution Platform Version</label>
          <input type="text" />
          <button>Deactivate Linting</button>
        </div>
      </div>
    `);

    bpmnjs._container.appendChild(panel);

    panel.querySelector('input').value = bpmnjs.getDefinitions().get('executionPlatformVersion');

    panel.querySelector('input').addEventListener('input', ({ target }) => {
      modeling.updateModdleProperties(
        canvas.getRootElement(),
        bpmnjs.getDefinitions(),
        { executionPlatformVersion: target.value }
      );
    });

    panel.querySelector('button').addEventListener('click', () => {
      if (linting.isActive()) {
        linting.deactivate();

        panel.querySelector('button').textContent = 'Activate Linting';
      } else {
        linting.activate();

        panel.querySelector('button').textContent = 'Deactivate Linting';
      }
    });
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


  describe('show error', function() {

    let clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
    });

    afterEach(function() {
      clock.restore();
    });


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

        clock.tick();

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

        // TODO(philippfromme): remove timeout once properties panel is fixed
        clock.tick();

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

  });


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