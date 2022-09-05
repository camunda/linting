import {
  bootstrapModeler,
  inject,
  insertCSS
} from 'bpmn-js/test/helper';

import sinon from 'sinon';

import lintingModule from '../../../modeler';

import diagramCSS from 'bpmn-js/dist/assets/diagram-js.css';
import bpmnCSS from 'bpmn-js/dist/assets/bpmn-js.css';
import bpmnFont from  'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import lintingCSS from '../../../assets/linting.css';

import diagramXML from './linting.bpmn';

insertCSS('diagram-js.css', diagramCSS);
insertCSS('bpmn-js.css', bpmnCSS);
insertCSS('bpmn-embedded.css', bpmnFont);
insertCSS('linting.css', lintingCSS);

describe('LintingAnnotations', function() {

  beforeEach(bootstrapModeler(diagramXML, {
    additionalModules: [
      lintingModule
    ]
  }));


  it('should add annotations', inject(function(elementRegistry, lintingAnnotations, overlays) {

    // given
    const serviceTask = elementRegistry.get('ServiceTask_1'),
          startEvent = elementRegistry.get('StartEvent_1');

    const reports = [
      {
        id: 'StartEvent_1',
        message: 'foo'
      },
      {
        id: 'ServiceTask_1',
        message: 'bar'
      }
    ];

    // when
    lintingAnnotations.setErrors(reports);

    // then
    expect(overlays.get({ type: 'linting' })).to.have.length(2);
    expect(overlays.get({ element: serviceTask })).to.have.length(1);
    expect(overlays.get({ element: startEvent })).to.have.length(1);
  }));


  it('should remove annotations', inject(function(elementRegistry, lintingAnnotations, overlays) {

    // given
    const serviceTask = elementRegistry.get('ServiceTask_1'),
          startEvent = elementRegistry.get('StartEvent_1');

    const reports = [
      {
        id: 'StartEvent_1',
        message: 'foo'
      },
      {
        id: 'ServiceTask_1',
        message: 'bar'
      }
    ];

    lintingAnnotations.setErrors(reports);

    // assume
    expect(overlays.get({ type: 'linting' })).to.have.length(2);

    // when
    lintingAnnotations.setErrors([]);

    // then
    expect(overlays.get({ type: 'linting' })).to.have.length(0);
    expect(overlays.get({ element: serviceTask })).to.have.length(0);
    expect(overlays.get({ element: startEvent })).to.have.length(0);
  }));


  it('should fire lintingAnnotations.click on annotation click', inject(
    function(eventBus, lintingAnnotations, overlays) {

      // given
      const reports = [
        {
          id: 'StartEvent_1',
          message: 'foo'
        }
      ];

      lintingAnnotations.setErrors(reports);

      const lintingAnnotationsClickSpy = sinon.spy();

      eventBus.on('lintingAnnotations.click', lintingAnnotationsClickSpy);

      // when
      overlays.get({ type: 'linting' })[ 0 ].html.click();

      // then
      expect(lintingAnnotationsClickSpy).to.have.been.calledOnce;
    }
  ));

});