import { expect } from 'chai';

import {
  bootstrapModeler,
  getBpmnJS,
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
  CloudElementTemplatesPropertiesProviderModule as cloudElementTemplatesPropertiesProviderModule,
  ElementTemplatesPropertiesProviderModule as elementTemplatesPropertiesProviderModule
} from 'bpmn-js-element-templates';
import elementTemplateChooserModule from '@bpmn-io/element-template-chooser';
import elementTemplateIconRendererModule from '@bpmn-io/element-template-icon-renderer';

import camundaCloudBehaviors from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import { domify } from 'min-dom';

import fileDrop from 'file-drops';

import download from 'downloadjs';

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
import elementTemplateChooserCSS from '@bpmn-io/element-template-chooser/dist/element-template-chooser.css';
import lintingCSS from '../../../assets/linting.css';

import diagramXMLCloud from './linting-cloud.bpmn';
import diagramCloudConfiguredXML from './linting-cloud-configured.bpmn';
import elementTemplates from './linting-element-templates-corpus';
import diagramCollaborationXMLCloud from './linting-collaboration-cloud.bpmn';
import diagramCollaborationELXMLCloud from './linting-collaboration-el.bpmn';
import diagramXMLCloudScroll from './linting-cloud-scroll.bpmn';
import diagramDuplicateHeadersXMLCloud from './linting-duplicate-headers-cloud.bpmn';
import diagramXMLPlatform from './linting-platform.bpmn';

insertCSS('diagram-js.css', diagramCSS);
insertCSS('bpmn-js.css', bpmnCSS);
insertCSS('bpmn-embedded.css', bpmnFont);
insertCSS('properties-panel.css', propertiesPanelCSS);
insertCSS('element-templates.css', elementTemplatesCSS);
insertCSS('element-template-chooser.css', elementTemplateChooserCSS);
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
    box-sizing: border-box;
    border-top: solid 1px #ccc;
    font-family: sans-serif;
  }

  .panel > * {
    padding: 5px;
  }
  .panel .errorContainer {
    resize: none;
    flex-grow: 1;
    background-color: #f7f7f8;
    border-bottom: solid 1px #CCC;
    font-family: sans-serif;
    line-height: 1.5;
    outline: none;
    overflow: auto;
  }

  .panel .errorItem {
    cursor: pointer;
  }

  .panel .errorDiagnostics {
    cursor: default;
    font-size: 11px;
    font-family: monospace;
    color: #555;
    margin: 2px 0 6px 0;
  }

  .panel .errorDiagnostics .fallback {
    color: #b35900;
  }

  .panel button,
  .panel input {
    width: 200px;
  }
`);


// drop a BPMN diagram into the playground
document.documentElement.addEventListener('dragover', fileDrop('Drop a BPMN diagram to open it in the currently active test.', function(files) {
  const bpmnJS = getBpmnJS();

  if (bpmnJS && files.length === 1) {
    bpmnJS.importXML(files[0].contents).catch((err) => {
      console.error('Failed to import dropped diagram', err);
    });
  }
}));

insertCSS('file-drops.css', `
  .drop-overlay .box {
    background: orange;
    border-radius: 3px;
    display: inline-block;
    font-family: sans-serif;
    padding: 4px 10px;
    position: fixed;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
  }
`);

// download diagrams using CTRL/CMD+S
document.addEventListener('keydown', function(event) {
  const bpmnJS = getBpmnJS();

  if (!bpmnJS) {
    return;
  }

  if (!(event.ctrlKey || event.metaKey) || event.code !== 'KeyS') {
    return;
  }

  event.preventDefault();

  bpmnJS.saveXML({ format: true }).then(function(result) {
    download(result.xml, 'diagram.bpmn', 'application/xml');
  }).catch(function(err) {
    console.error('Failed to download diagram', err);
  });
});


const singleStart = window.__env__ && window.__env__.SINGLE_START;

const linter = new Linter();

describe('Linting', function() {

  function createModeler(diagramXML, options = {}) {
    const {
      additionalModules = [],
      moddleExtensions = {},
      ...rest
    } = options;

    return bootstrapModeler(diagramXML, {
      additionalModules: [
        lintingModule,
        propertiesPanelModule,
        bpmnPropertiesProviderModule,
        ...additionalModules
      ],
      moddleExtensions: {
        modeler: modelerModdleExtension,
        ...moddleExtensions
      },
      ...rest
    });
  }

  function lintingExample(bpmnjs, canvas, elementRegistry, eventBus, linting, modeling, propertiesPanel) {

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

    // resolve a report to a small diagnostics node showing how it maps to a
    // properties panel entry: via the `propertiesPanel#getEntryId` API
    // (rendering-aware, render-agnostic) or the statically derived fallback ids
    const resolveDiagnostics = (report) => {
      const modelElement = elementRegistry.get(report.id)
        || elementRegistry.filter(el => {
          const processRef = el.businessObject && el.businessObject.processRef;

          return processRef && processRef.id === report.id;
        })[ 0 ];

      const paths = report.paths || (report.path ? [ report.path ] : []);

      const fallbackIds = (report.propertiesPanel && report.propertiesPanel.entryIds) || [];

      if (!paths.length && !fallbackIds.length) {
        return null;
      }

      const resolvedIds = paths.map(path => (modelElement && path && path.length
        ? propertiesPanel.getEntryId(modelElement, path) || null
        : null));

      const resolvedViaApi = resolvedIds.length > 0 && resolvedIds.every(Boolean);

      const resolved = resolvedViaApi
        ? `api → ${ resolvedIds.join(', ') }`
        : `<span class="fallback">fallback → ${ fallbackIds.join(', ') || '(none)' }</span>`;

      return domify(`<div class="errorDiagnostics">${ escapeHTML(JSON.stringify(paths)) } ⇒ ${ resolved }</div>`);
    };

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

          // surface how the report resolves to a properties panel entry, so we
          // can validate render-agnostic resolution: the `propertiesPanel#getEntryId`
          // API (rendering-aware) vs. the statically derived fallback ids
          const diagnostics = resolveDiagnostics(report);

          if (diagnostics) {
            element.appendChild(diagnostics);
          }

          return element;
        }).forEach(item => {
          container.appendChild(item);
        });
      });
    };

    lint();

    eventBus.on('elements.changed', lint);
    eventBus.on('import.done', lint);

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

    beforeEach(createModeler(diagramXMLCloud, {
      additionalModules: [
        camundaCloudBehaviors,
        zeebePropertiesProviderModule,
        cloudElementTemplatesPropertiesProviderModule
      ],
      moddleExtensions: {
        zeebe: zeebeModdleExtension
      }
    }));


    it('should not be active by default', inject(function(linting) {

      // then
      expect(linting.isActive()).to.be.false;
    }));


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


      it('should resolve shown entry via propertiesPanel#getEntryId', inject(
        function(elementRegistry, propertiesPanel, linting, eventBus) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');

          const path = [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ];

          const report = {
            id: 'ServiceTask_1',
            category: 'error',
            message: 'Invalid.',
            path,

            // statically derived id, as baked by the headless linter
            propertiesPanel: {
              entryIds: [ 'ServiceTask_1-input-0-source' ]
            }
          };

          // the properties panel knows how the element is actually rendered
          const getEntryIdSpy = sinon.stub(propertiesPanel, 'getEntryId')
            .returns('custom-entry-my.template-1');

          linting.setErrors([ report ]);
          linting.activate();

          const propertiesPanelShowEntrySpy = sinon.spy();

          eventBus.on('propertiesPanel.showEntry', propertiesPanelShowEntrySpy);

          // when
          linting.showError(report);

          clock.tick();

          // then
          expect(getEntryIdSpy).to.have.been.calledWith(serviceTask, path);

          expect(propertiesPanelShowEntrySpy).to.have.been.calledOnce;
          expect(propertiesPanelShowEntrySpy).to.have.been.calledWithMatch({
            id: 'custom-entry-my.template-1'
          });
        }
      ));


      it('should resolve panel errors via propertiesPanel#getEntryId', inject(
        function(elementRegistry, propertiesPanel, linting, selection, eventBus) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');

          const path = [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ];

          const report = {
            id: 'ServiceTask_1',
            category: 'error',
            message: 'Invalid.',
            path,
            propertiesPanel: {
              entryIds: [ 'ServiceTask_1-input-0-source' ]
            }
          };

          const getEntryIdSpy = sinon.stub(propertiesPanel, 'getEntryId')
            .returns('custom-entry-my.template-1');

          linting.setErrors([ report ]);
          linting.activate();

          const propertiesPanelSetErrorSpy = sinon.spy();

          eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

          // when
          selection.select(serviceTask);

          // then
          expect(getEntryIdSpy).to.have.been.calledWith(serviceTask, path);

          expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
            errors: {
              'custom-entry-my.template-1': 'Invalid.'
            }
          });
        }
      ));


      it('should resolve multi-field panel errors via propertiesPanel#getEntryId', inject(
        function(elementRegistry, propertiesPanel, linting, selection, eventBus) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');

          // a duplicate-key finding: several offending leaf locations
          const paths = [
            [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ],
            [ 'extensionElements', 'values', 0, 'inputParameters', 1, 'source' ]
          ];

          const report = {
            id: 'ServiceTask_1',
            category: 'error',
            message: 'Duplicate.',
            path: null,
            paths,
            propertiesPanel: {
              entryIds: [ 'ServiceTask_1-input-0-source', 'ServiceTask_1-input-1-source' ]
            }
          };

          // resolve each leaf location to its own (hypothetical) template field
          const getEntryIdSpy = sinon.stub(propertiesPanel, 'getEntryId')
            .callsFake((element, path) => `custom-entry-my.template-${ path[ path.length - 2 ] }`);

          linting.setErrors([ report ]);
          linting.activate();

          const propertiesPanelSetErrorSpy = sinon.spy();

          eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

          // when
          selection.select(serviceTask);

          // then
          // one lookup per offending leaf location
          expect(getEntryIdSpy).to.have.been.calledTwice;

          expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
            errors: {
              'custom-entry-my.template-0': 'Duplicate.',
              'custom-entry-my.template-1': 'Duplicate.'
            }
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

        beforeEach(createModeler(diagramCollaborationXMLCloud, {
          additionalModules: [
            camundaCloudBehaviors,
            zeebePropertiesProviderModule,
            cloudElementTemplatesPropertiesProviderModule
          ],
          moddleExtensions: {
            zeebe: zeebeModdleExtension
          }
        }));


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


      describe('collaboration with execution listener', function() {

        beforeEach(createModeler(diagramCollaborationELXMLCloud, {
          additionalModules: [
            camundaCloudBehaviors,
            zeebePropertiesProviderModule,
            cloudElementTemplatesPropertiesProviderModule
          ],
          moddleExtensions: {
            zeebe: zeebeModdleExtension
          }
        }));


        it('should show error on participant', inject(
          async function(bpmnjs, elementRegistry, eventBus, linting, selection) {

            // given
            const participant = elementRegistry.get('Participant_1');

            const reports = await linter.lint(bpmnjs.getDefinitions());

            const report = reports.find(report => report.id === 'Process_1');

            linting.setErrors(reports);

            linting.activate();

            const propertiesPanelSetErrorSpy = sinon.spy();

            eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

            const propertiesPanelShowEntrySpy = sinon.spy();

            eventBus.on('propertiesPanel.showEntry', propertiesPanelShowEntrySpy);

            // when
            linting.showError(report);

            clock.tick();

            // then
            expect(selection.get()).to.eql([ participant ]);

            expect(propertiesPanelSetErrorSpy).to.have.been.calledOnce;
            expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
              errors: getErrors(reports, participant)
            });

            expect(propertiesPanelShowEntrySpy).to.have.been.calledOnce;
            expect(propertiesPanelShowEntrySpy).to.have.been.calledWithMatch({
              id: 'Participant_1-executionListener-0-listenerType'
            });
          }
        ));

      });

    });


    describe('canvas scrolling', function() {

      beforeEach(createModeler(diagramXMLCloudScroll, {
        additionalModules: [
          camundaCloudBehaviors,
          zeebePropertiesProviderModule,
          cloudElementTemplatesPropertiesProviderModule
        ],
        moddleExtensions: {
          zeebe: zeebeModdleExtension
        }
      }));

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


  describe('Camunda Cloud - end-to-end example', function() {

    beforeEach(createModeler(diagramCloudConfiguredXML, {
      additionalModules: [
        camundaCloudBehaviors,
        zeebePropertiesProviderModule,
        cloudElementTemplatesPropertiesProviderModule,
        elementTemplateIconRendererModule,
        elementTemplateChooserModule
      ],
      moddleExtensions: {
        zeebe: zeebeModdleExtension
      },
      elementTemplates
    }));


    (singleStart === 'cloud' ? it.only : it)('example', inject(lintingExample));


    describe('entry resolution', function() {

      it('should source ad-hoc tools schema template for service tasks', inject(function(elementRegistry, elementTemplates) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        // when
        const compatibleTemplates = elementTemplates.getCompatible(serviceTask);

        // then
        expect(compatibleTemplates).to.satisfy(templates => {
          return templates.some(template => template.id === 'io.camunda.connectors.agenticai.adhoctoolsschema.v1');
        });
      }));


      it('should resolve a stock ad-hoc finding to a properties panel entry', inject(
        async function(bpmnjs, elementRegistry, propertiesPanel) {

          // given
          const adHocSubProcess = elementRegistry.get('AdHocSubProcess_1');

          const reports = await linter.lint(bpmnjs.getDefinitions());

          // assume
          const report = reports.find(report => report.id === 'AdHocSubProcess_1');

          expect(report, 'expected an ad-hoc sub-process report').to.exist;
          expect(report.path, 'expected a leaf path on the report').to.be.an('array');

          // when
          const errors = getErrors(
            reports,
            adHocSubProcess,
            (element, path) => propertiesPanel.getEntryId(element, path)
          );

          // then
          // the finding resolves to the rendered entry (render-agnostic path,
          // falling back to the statically derived id when no provider answers)
          expect(errors).to.have.property('adHocOutputElement');
        }
      ));


      it('should lint the configured agent and its tools', inject(
        async function(bpmnjs) {

          // when
          const reports = await linter.lint(bpmnjs.getDefinitions());

          // then
          // the agent's invalid FEEL `retries` (template-bound field)
          expect(
            reports.some(report => report.id === 'AiAgent_1'),
            'expected a finding on the configured AI Agent'
          ).to.be.true;

          // the tool's duplicate `fromAi()` keys (agent-fromai-contract)
          expect(
            reports.some(report => report.id === 'Tool_Search'),
            'expected a fromAi() finding on the HTTP REST tool'
          ).to.be.true;
        }
      ));


      it('should resolve a tool fromAi() finding to a properties panel entry', inject(
        async function(bpmnjs, elementRegistry, propertiesPanel) {

          // given
          const tool = elementRegistry.get('Tool_Search');

          const reports = await linter.lint(bpmnjs.getDefinitions());

          const report = reports.find(report => report.id === 'Tool_Search');

          // assume
          expect(report, 'expected a fromAi() finding on Tool_Search').to.exist;

          // when
          const errors = getErrors(
            reports,
            tool,
            (element, path) => propertiesPanel.getEntryId(element, path)
          );

          // then
          // the finding resolves to an entry (render-agnostic path, falling back
          // to the statically derived id when no provider answers)
          expect(Object.keys(errors)).not.to.be.empty;
        }
      ));


      it('should resolve a tool documentation finding to a properties panel entry', inject(
        async function(bpmnjs, elementRegistry, propertiesPanel) {

          // given
          const tool = elementRegistry.get('Tool_Bedrock');

          const reports = await linter.lint(bpmnjs.getDefinitions());

          const report = reports.find(
            report => report.id === 'Tool_Bedrock'
              && report.rule === 'camunda-compat/agent-tool-documentation'
          );

          // assume
          expect(report, 'expected a documentation finding on Tool_Bedrock').to.exist;
          expect(report.path).to.eql([ 'documentation' ]);

          // when
          // navigation for a (warning) finding resolves its path via the panel's
          // #getEntryId API — the same mechanism Linting#showError uses
          const entryId = propertiesPanel.getEntryId(tool, report.path);

          // then
          // missing documentation resolves render-agnostically to the standard
          // bpmn `documentation` entry (no static fallback, no entryIds on rule)
          expect(entryId).to.equal('documentation');
        }
      ));


      it('should resolve a tool output-key finding to a properties panel entry', inject(
        async function(bpmnjs, elementRegistry, propertiesPanel) {

          // given
          const tool = elementRegistry.get('Tool_LocalSummarize');

          const reports = await linter.lint(bpmnjs.getDefinitions());

          const report = reports.find(
            report => report.id === 'Tool_LocalSummarize'
              && report.rule === 'camunda-compat/agent-tool-output-key'
          );

          // assume
          expect(report, 'expected an output-key finding on Tool_LocalSummarize').to.exist;
          expect(report.path, 'expected a leaf path on the finding').to.be.an('array');

          // when
          const entryId = propertiesPanel.getEntryId(tool, report.path);

          // then
          // the misdirected output write resolves render-agnostically to the
          // standard output field entry (the bedrock template does not bind this
          // output, so the zeebe provider answers) — never a static fallback
          expect(entryId).to.equal('Tool_LocalSummarize-output-0-target');
        }
      ));


      // A real lint report on a template-bound field resolves to the template's
      // `custom-entry-*` id via the `propertiesPanel#getEntryId` API — not the
      // static fallback.
      describe('template entry resolution', function() {

        function expectResolvesTo(elementId, path, expectedEntryId) {
          return inject(async function(bpmnjs, elementRegistry, propertiesPanel) {

            // given
            const element = elementRegistry.get(elementId);

            const reports = await linter.lint(bpmnjs.getDefinitions());

            const report = reports.find(report => {
              const paths = report.paths || (report.path ? [ report.path ] : []);

              return report.id === elementId
                && paths.some(p => JSON.stringify(p) === JSON.stringify(path));
            });

            // assume
            expect(report, `expected a report on ${ elementId } at ${ JSON.stringify(path) }`).to.exist;

            // when
            const errors = getErrors(
              [ report ],
              element,
              (element, path) => propertiesPanel.getEntryId(element, path)
            );

            // then
            // the finding resolves render-agnostically to the template entry, not
            // the statically derived fallback id
            expect(errors).to.have.property(expectedEntryId);
          });
        }


        it('should resolve a "zeebe:taskDefinition" finding to its template entry',
          expectResolvesTo(
            'ServiceTask_1',
            [ 'extensionElements', 'values', 0, 'retries' ],
            'custom-entry-linting.service-1'
          )
        );


        it('should resolve a "zeebe:input" finding to its template entry',
          expectResolvesTo(
            'ServiceTask_1',
            [ 'extensionElements', 'values', 1, 'inputParameters', 0, 'source' ],
            'custom-entry-linting.service-2'
          )
        );


        it('should resolve a "zeebe:calledElement" finding to its template entry',
          expectResolvesTo(
            'CallActivity_1',
            [ 'extensionElements', 'values', 0, 'processId' ],
            'custom-entry-linting.call-0'
          )
        );


        // the composed proof for reference-following paths: a subscription
        // finding on a message event addresses the referenced message's
        // zeebe:Subscription via `messageRef`, and still resolves to the
        // template's correlation key entry rather than the static fallback
        it('should resolve a reference-following "zeebe:subscription" finding to its template entry',
          expectResolvesTo(
            'MessageEvent_1',
            [ 'eventDefinitions', 0, 'messageRef', 'extensionElements', 'values', 0, 'correlationKey' ],
            'custom-entry-linting.message-1'
          )
        );

      });

    });

  });


  describe('Camunda Cloud - multi-target entry resolution', function() {

    // a finding that spans several sibling locations (duplicate task-header
    // keys) emits one leaf path per offending header in `report.paths`
    // (bpmnlint-plugin-camunda-compat#255); each maps 1:1 to a rendered entry
    beforeEach(createModeler(diagramDuplicateHeadersXMLCloud, {
      additionalModules: [
        camundaCloudBehaviors,
        zeebePropertiesProviderModule
      ],
      moddleExtensions: {
        zeebe: zeebeModdleExtension
      }
    }));


    it('should emit one leaf path per duplicate header', inject(
      async function(bpmnjs) {

        // when
        const reports = await linter.lint(bpmnjs.getDefinitions());

        const report = reports.find(({ rule }) => rule === 'camunda-compat/duplicate-task-headers');

        // then
        expect(report, 'expected a duplicate-task-headers finding').to.exist;

        // the multi-target finding exposes one leaf path per offending header
        expect(report.paths).to.have.length(2);
      }
    ));


    it('should resolve every duplicate header to its own entry', inject(
      async function(bpmnjs, elementRegistry, propertiesPanel) {

        // given
        const serviceTask = elementRegistry.get('ServiceTask_1');

        const reports = await linter.lint(bpmnjs.getDefinitions());

        // when
        // resolve render-agnostically through the `propertiesPanel#getEntryId`
        // API, falling back to the statically derived ids when no provider answers
        const errors = getErrors(
          reports,
          serviceTask,
          (element, path) => propertiesPanel.getEntryId(element, path)
        );

        // then
        // each offending header key maps to its own entry, both flagged with the
        // same finding-derived message
        expect(errors).to.have.property('ServiceTask_1-header-0-key', 'Must be unique.');
        expect(errors).to.have.property('ServiceTask_1-header-1-key', 'Must be unique.');
      }
    ));

  });


  describe('Camunda Cloud - config', function() {

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


  describe('Camunda Cloud - entry resolution fallback', function() {

    // a finding as baked by the headless linter: a moddle `path` plus the
    // statically derived (render-agnostic) fallback id
    const report = {
      id: 'ServiceTask_1',
      category: 'error',
      message: 'Invalid.',
      path: [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ],
      propertiesPanel: {
        entryIds: [ 'ServiceTask_1-input-0-source' ]
      }
    };


    describe('without a properties panel', function() {

      // the properties panel is an optional peer dependency; without it,
      // `injector.get('propertiesPanel', false)` yields nothing and resolution
      // degrades to the statically derived ids
      beforeEach(bootstrapModeler(diagramXMLCloud, {
        additionalModules: [
          lintingModule
        ],
        moddleExtensions: {
          zeebe: zeebeModdleExtension
        }
      }));


      it('should fall back to static ids for panel errors', inject(
        function(elementRegistry, linting, selection, eventBus) {

          // given
          const serviceTask = elementRegistry.get('ServiceTask_1');

          linting.setErrors([ report ]);
          linting.activate();

          const propertiesPanelSetErrorSpy = sinon.spy();

          eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

          // when
          selection.select(serviceTask);

          // then
          expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
            errors: {
              'ServiceTask_1-input-0-source': 'Invalid.'
            }
          });
        }
      ));


      it('should fall back to static ids for shown entry', inject(
        function(linting, eventBus) {

          // given
          const clock = sinon.useFakeTimers();

          linting.setErrors([ report ]);
          linting.activate();

          const propertiesPanelShowEntrySpy = sinon.spy();

          eventBus.on('propertiesPanel.showEntry', propertiesPanelShowEntrySpy);

          // when
          linting.showError(report);

          clock.tick();

          // then
          expect(propertiesPanelShowEntrySpy).to.have.been.calledWithMatch({
            id: 'ServiceTask_1-input-0-source'
          });

          clock.restore();
        }
      ));

    });


    describe('with a properties panel lacking #getEntryId', function() {

      // the supported peer range (`>= 2.0.0`) predates the `#getEntryId` API;
      // an older panel without it must degrade to the statically derived ids
      beforeEach(createModeler(diagramXMLCloud, {
        additionalModules: [
          zeebePropertiesProviderModule
        ],
        moddleExtensions: {
          zeebe: zeebeModdleExtension
        }
      }));


      it('should fall back to static ids for panel errors', inject(
        function(elementRegistry, propertiesPanel, linting, selection, eventBus) {

          // given
          // simulate an older panel that has no resolution API
          propertiesPanel.getEntryId = undefined;

          const serviceTask = elementRegistry.get('ServiceTask_1');

          linting.setErrors([ report ]);
          linting.activate();

          const propertiesPanelSetErrorSpy = sinon.spy();

          eventBus.on('propertiesPanel.setErrors', propertiesPanelSetErrorSpy);

          // when
          selection.select(serviceTask);

          // then
          expect(propertiesPanelSetErrorSpy).to.have.been.calledWithMatch({
            errors: {
              'ServiceTask_1-input-0-source': 'Invalid.'
            }
          });
        }
      ));


      it('should fall back to static ids for shown entry', inject(
        function(propertiesPanel, linting, eventBus) {

          // given
          const clock = sinon.useFakeTimers();

          propertiesPanel.getEntryId = undefined;

          linting.setErrors([ report ]);
          linting.activate();

          const propertiesPanelShowEntrySpy = sinon.spy();

          eventBus.on('propertiesPanel.showEntry', propertiesPanelShowEntrySpy);

          // when
          linting.showError(report);

          clock.tick();

          // then
          expect(propertiesPanelShowEntrySpy).to.have.been.calledWithMatch({
            id: 'ServiceTask_1-input-0-source'
          });

          clock.restore();
        }
      ));

    });

  });


  describe('Camunda', function() {

    beforeEach(createModeler(diagramXMLPlatform, {
      additionalModules: [
        camundaPlatformPropertiesProviderModule,
        elementTemplatesPropertiesProviderModule
      ],
      moddleExtensions: {
        camunda: camundaModdleExtension
      }
    }));

    (singleStart === 'platform' ? it.only : it)('example', inject(lintingExample));

  });

});

function escapeHTML(string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}