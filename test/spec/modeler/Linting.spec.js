import {
  bootstrapModeler,
  inject,
  insertCSS
} from 'bpmn-js/test/helper';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import zeebeModdleExtension from 'zeebe-bpmn-moddle/resources/zeebe';
import camundaModdleExtension from 'camunda-bpmn-moddle/resources/camunda';
import modelerModdleExtension from 'modeler-moddle/resources/modeler';

import {
  BpmnPropertiesPanelModule as propertiesPanelModule,
  BpmnPropertiesProviderModule as bpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule as camundaPlatformPropertiesProviderModule,
  ZeebePropertiesProviderModule as zeebePropertiesProviderModule,
} from 'bpmn-js-properties-panel';

import {
  CloudElementTemplatesPropertiesProviderModule as cloudElementTemplatesPropertiesProvider,
  ElementTemplatesPropertiesProviderModule as elementTemplatesPropertiesProviderModule
} from 'bpmn-js-element-templates';

import camundaCloudBehaviors from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import { domify } from 'min-dom';

import sinon from 'sinon';

import StaticResolver from 'bpmnlint/lib/resolver/static-resolver';

import { Linter } from '../../..';

import lintingModule from '../../../modeler';

import { getErrors } from '../../../lib/utils/properties-panel';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';
import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFont from 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import propertiesPanelCSS from '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import elementTemplatesCSS from 'bpmn-js-element-templates/dist/assets/element-templates.css';
import lintingCSS from '../../../assets/linting.css';

import diagramXMLCloud from './linting-cloud.bpmn';
import diagramCollaborationXMLCloud from './linting-collaboration-cloud.bpmn';
import diagramXMLCloudScroll from './linting-cloud-scroll.bpmn';
import diagramXMLPlatform from './linting-platform.bpmn';

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

  .panel .errorContainer {
    resize: none;
    flex-grow: 1;
    background-color: #f7f7f8;
    border: none;
    margin-bottom: 5px;
    font-family: sans-serif;
    line-height: 1.5;
    outline: none;
  }

  .panel .errorItem {
    cursor: pointer;
  }

  .panel button,
  .panel input {
    width: 200px;
  }
`);


const singleStart = window.__env__ && window.__env__.SINGLE_START;

const linter = new Linter();

describe('Linting', function() {

  function createModeler(diagramXML, additionalModules, moddleExtensions) {
    return bootstrapModeler(diagramXML, {
      additionalModules: [
        lintingModule,
        propertiesPanelModule,
        bpmnPropertiesProviderModule,
        camundaCloudBehaviors,
        ...additionalModules
      ],
      moddleExtensions: {
        modeler: modelerModdleExtension,
        ...moddleExtensions
      }
    });
  }

  function lintingExample(bpmnjs, canvas, eventBus, linting, modeling, propertiesPanel) {

    // given
    const FooPlugin = {
      config: {
        rules: {
          'foo/fake-join': 'warn',
          'foo/rule-error': 'error'
        }
      },
      resolver: new StaticResolver({
        'rule:bpmnlint-plugin-foo/fake-join': require('bpmnlint/rules/fake-join'),
        'rule:bpmnlint-plugin-foo/rule-error': () => {
          return {
            check() {
              throw new Error('Oh no!');
            }
          };
        }
      })
    };

    let modeler = 'desktop';

    const createLinter = modeler => {
      return new Linter({
        modeler,
        plugins: [
          FooPlugin
        ]
      });
    };

    let linter = createLinter(modeler);

    const lint = () => {
      const definitions = bpmnjs.getDefinitions();

      linter.lint(definitions).then(reports => {
        linting.setErrors(reports);

        const container = panel.querySelector('.errorContainer');
        container.innerHTML = '';

        reports.map((report) => {
          const { id, message, category, rule, meta } = report;

          if (category === 'rule-error') {
            return domify(`<div class="errorItem"><strong>${ category }</strong> Rule <${ escapeHTML(rule) }> errored with the following message: ${ escapeHTML(message) }</div>`);
          }

          const element = domify(`<div class="errorItem"><strong>${ category }</strong> ${ id }: ${escapeHTML(message) } </div>`);

          if (meta?.documentation?.url) {
            const documentationLink = domify(`<a href="${ meta?.documentation?.url }" rel="noopener" target="_blank">ref</a>`);

            documentationLink.addEventListener('click', e => e.stopPropagation());

            element.appendChild(documentationLink);
          }

          element.addEventListener('click', () => {
            linting.showError(report);
          });
          return element;
        }).forEach(item => {
          container.appendChild(item);
        });
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
        <div class="errorContainer"></div>
        <div>
          <label>Execution Platform Version</label>
          <input type="text" />
          <label>Modeler</label>
          <select>
            <option value="desktop">Desktop</option>
            <option value="web">Web</option>
          </select>
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

    panel.querySelector('select').value = modeler;

    panel.querySelector('select').addEventListener('change', ({ target }) => {
      modeler = target.value;

      linter = createLinter(modeler);

      lint();
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
  }


  describe('Camunda Cloud', function() {

    beforeEach(createModeler(diagramXMLCloud,
      [
        zeebePropertiesProviderModule,
        cloudElementTemplatesPropertiesProvider
      ],
      {
        zeebe: zeebeModdleExtension
      })
    );

    (singleStart === 'cloud' ? it.only : it)('example', inject(function(bpmnjs, canvas, eventBus, linting, modeling, propertiesPanel) {

      lintingExample(bpmnjs, canvas, eventBus, linting, modeling, propertiesPanel);
    }));


    it('should not be active by default', inject(function(linting) {

      // then
      expect(linting.isActive()).to.be.false;
    }));


    describe('config', function() {

      beforeEach(bootstrapModeler(diagramXMLCloud, {
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


    it('should not show overlay on root element', inject(async function(canvas, linting, overlays) {

      // given
      const root = canvas.getRootElement();

      const reports = [
        {
          id: root.id,
          message: 'foo'
        }
      ];

      // when
      linting.setErrors(reports);
      linting.activate();

      // then
      expect(overlays.get({ type: 'linting' })).to.have.length(0);
    }));


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

      // TODO(philippfromme): remove timeout once properties panel is fixed
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


      it('should select root element', inject(
        async function(canvas, linting, selection, elementRegistry) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');
          const root = canvas.getRootElement();

          const reports = [
            {
              id: root.id,
              message: 'foo'
            }
          ];

          linting.setErrors(reports);
          linting.activate();

          selection.select(serviceTask);

          // assume
          expect(selection.get()).to.eql([ serviceTask ]);

          // when
          linting.showError(reports[ 0 ]);
          clock.tick();

          // then
          expect(selection.get()).to.eql([]);
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


      describe('collaboration', function() {

        beforeEach(createModeler(diagramCollaborationXMLCloud,
          [
            zeebePropertiesProviderModule,
            cloudElementTemplatesPropertiesProvider
          ],
          {
            zeebe: zeebeModdleExtension
          })
        );


        it('should select participant', inject(
          async function(linting, selection, elementRegistry) {

            // given
            const participant = elementRegistry.get('Participant_1');

            const reports = [
              {
                id: getBusinessObject(participant).get('processRef').id,
                message: 'foo'
              }
            ];

            linting.setErrors(reports);
            linting.activate();

            // when
            linting.showError(reports[ 0 ]);
            clock.tick();

            // then
            expect(selection.get()).to.eql([ participant ]);
          }
        ));

      });

    });


    describe('canvas scrolling', function() {

      beforeEach(createModeler(diagramXMLCloudScroll,
        [
          zeebePropertiesProviderModule,
          cloudElementTemplatesPropertiesProvider
        ],
        {
          zeebe: zeebeModdleExtension
        })
      );

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


      it('should set correct root element (nested task)', inject(
        function(canvas, linting, elementRegistry) {

          // given
          const reports = [
            {
              id: 'NestedTask_1',
              message: 'foo'
            }
          ];

          linting.setErrors(reports);

          linting.activate();

          const scrollToElementSpy = sinon.spy(canvas, 'scrollToElement');

          // when
          linting.showError(reports[ 0 ]);

          // then
          expect(scrollToElementSpy).to.have.been.called;
          expect(canvas.getRootElement().id).to.eql('SubProcess_1_plane');
        }
      ));


      it('should set correct root element (error in root)', inject(
        function(canvas, linting, elementRegistry) {

          // given
          const subProcessPlane = elementRegistry.get('SubProcess_1_plane');

          canvas.setRootElement(subProcessPlane);

          const reports = [
            {
              id: 'Process_1',
              message: 'foo'
            }
          ];

          linting.setErrors(reports);

          linting.activate();

          const scrollToElementSpy = sinon.spy(canvas, 'scrollToElement');

          // when
          linting.showError(reports[ 0 ]);

          // then
          expect(scrollToElementSpy).to.have.been.called;
          expect(canvas.getRootElement().id).to.eql('Process_1');
        }
      ));


      it('should not scroll if element not found', inject(
        function(canvas, linting) {

          // given
          const reports = [
            {
              id: 'Foo',
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
          expect(scrollToElementSpy).not.to.have.been.called;
        }
      ));
    });

  });


  describe('Camunda', function() {

    beforeEach(createModeler(diagramXMLPlatform,
      [
        camundaPlatformPropertiesProviderModule,
        elementTemplatesPropertiesProviderModule
      ],
      {
        camunda: camundaModdleExtension
      })
    );

    (singleStart === 'platform' ? it.only : it)('example', inject(function(bpmnjs, canvas, eventBus, linting, modeling, propertiesPanel) {

      lintingExample(bpmnjs, canvas, eventBus, linting, modeling, propertiesPanel);
    }));

  });

});

function escapeHTML(string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}