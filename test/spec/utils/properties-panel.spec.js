import { expect } from 'chai';

import { Linter } from '../../..';

import {
  getEntryId,
  getErrorMessage,
  getErrors
} from '../../../lib/utils/properties-panel';

import {
  createElement,
  readModdle
} from '../../helper';

import { getLintError } from './lint-helper';

describe('utils/properties-panel', function() {

  describe('#getEntryId', function() {

    it('businessRuleImplementation', async function() {

      // given
      const node = createElement('bpmn:BusinessRuleTask');

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

      const { camundaCloud13: config } = await  import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

      const report = await getLintError(node, rule, config);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('businessRuleImplementation');
    });


    it('errorRef', async function() {

      // given
      const node = createElement('bpmn:EndEvent', {
        eventDefinitions: [
          createElement('bpmn:ErrorEventDefinition')
        ]
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

      const report = await getLintError(node, rule);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('errorRef');
    });


    it('messageRef', async function() {

      // given
      const node = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [
          createElement('bpmn:MessageEventDefinition')
        ]
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/message-reference');

      const report = await getLintError(node, rule);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('messageRef');
    });


    it('decisionId', async function() {

      // given
      const node = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision', {
              resultVariable: 'foo'
            })
          ]
        })
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

      const { camundaCloud13: config } = await  import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

      const report = await getLintError(node, rule, config);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('decisionId');
    });


    it('resultVariable', async function() {

      // given
      const node = createElement('bpmn:BusinessRuleTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:CalledDecision', {
              decisionId: 'foo'
            })
          ]
        })
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

      const { camundaCloud13: config } = await  import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

      const report = await getLintError(node, rule, config);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('resultVariable');
    });


    it('errorCode', async function() {

      // given
      const node = createElement('bpmn:EndEvent', {
        eventDefinitions: [
          createElement('bpmn:ErrorEventDefinition', {
            errorRef: createElement('bpmn:Error')
          })
        ]
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

      const report = await getLintError(node, rule);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('errorCode');
    });


    it('messageName', async function() {

      // given
      const node = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [
          createElement('bpmn:MessageEventDefinition', {
            messageRef: createElement('bpmn:Message')
          })
        ]
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/message-reference');

      const report = await getLintError(node, rule);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('messageName');
    });


    describe('multiInstance-inputCollection', function() {

      it('no loop characteristics', async function() {

        // given
        const node = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/loop-characteristics');

        const report = await getLintError(node, rule);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('multiInstance-inputCollection');
      });


      it('no input collection', async function() {

        // given
        const node = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:LoopCharacteristics')
              ]
            })
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/loop-characteristics');

        const report = await getLintError(node, rule);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('multiInstance-inputCollection');
      });

    });


    it('multiInstance-outputCollection', async function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:LoopCharacteristics', {
                inputCollection: 'foo',
                outputElement: 'bar'
              })
            ]
          })
        })
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/loop-characteristics');

      const report = await getLintError(node, rule);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('multiInstance-outputCollection');
    });


    it('multiInstance-outputElement', async function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:LoopCharacteristics', {
                inputCollection: 'foo',
                outputCollection: 'bar'
              })
            ]
          })
        })
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/loop-characteristics');

      const report = await getLintError(node, rule);

      // when
      const entryId = getEntryId(report);

      // then
      expect(entryId).to.equal('multiInstance-outputElement');
    });


    describe('targetProcessId', function() {

      it('no called element', async function() {

        // given
        const node = createElement('bpmn:CallActivity');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-element');

        const report = await getLintError(node, rule);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('targetProcessId');
      });


      it('no process ID', async function() {

        // given
        const node = createElement('bpmn:CallActivity', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:CalledElement')
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-element');

        const report = await getLintError(node, rule);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('targetProcessId');
      });

    });


    describe('taskDefinitionType', function() {

      it('no task definition', async function() {

        // given
        const node = createElement('bpmn:ServiceTask');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

        const { camundaCloud10: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

        const report = await getLintError(node, rule, config);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('taskDefinitionType');
      });


      it('no type', async function() {

        // given
        const node = createElement('bpmn:ServiceTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:TaskDefinition')
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

        const { camundaCloud10: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

        const report = await getLintError(node, rule, config);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('taskDefinitionType');
      });

    });


    describe('messageSubscriptionCorrelationKey', function() {

      it('no subscription', async function() {

        // given
        const node = createElement('bpmn:ReceiveTask', {
          messageRef: createElement('bpmn:Message')
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/subscription');

        const report = await getLintError(node, rule);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('messageSubscriptionCorrelationKey');
      });


      it('no correlation key', async function() {

        // given
        const node = createElement('bpmn:ReceiveTask', {
          messageRef: createElement('bpmn:Message', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:Subscription')
              ]
            })
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/subscription');

        const report = await getLintError(node, rule);

        // when
        const entryId = getEntryId(report);

        // then
        expect(entryId).to.equal('messageSubscriptionCorrelationKey');
      });

    });

  });


  describe('#getErrors', function() {

    it('should return errors', async function() {

      // given
      const { root } = await readModdle('test/spec/utils/properties-panel.bpmn');

      const reports = await Linter.lint(root);

      // when
      let element = root.rootElements[ 0 ].flowElements.find(({ id }) => id === 'ServiceTask_1');

      let errors = getErrors(reports, element);

      // then
      expect(errors).to.eql({
        taskDefinitionType: 'Type must be defined.'
      });

      // when
      element = root.rootElements[ 0 ].flowElements.find(({ id }) => id === 'CallActivity_1');

      errors = getErrors(reports, element);

      // then
      expect(errors).to.eql({
        targetProcessId: 'Process ID must be defined.'
      });
    });

  });


  describe('#getErrorMessage', function() {

    expectErrorMessage('businessRuleTaskImplementation', 'Implementation must be defined.');


    expectErrorMessage('errorRef', 'Global error reference must be defined.');


    expectErrorMessage('messageRef', 'Global message reference must be defined.');


    expectErrorMessage('decisionId', 'Decision ID must be defined.');


    expectErrorMessage('resultVariable', 'Result variable must be defined.');


    expectErrorMessage('errorCode', 'Code must be defined.');


    expectErrorMessage('messageName', 'Name must be defined.');


    expectErrorMessage('multiInstance-inputCollection', 'Input collection must be defined.');


    expectErrorMessage('multiInstance-outputCollection', 'Output collection must be defined.');


    expectErrorMessage('multiInstance-outputElement', 'Output element must be defined.');


    expectErrorMessage('targetProcessId', 'Process ID must be defined.');


    expectErrorMessage('taskDefinitionType', 'Type must be defined.');


    expectErrorMessage('messageSubscriptionCorrelationKey', 'Subscription correlation key must be defined.');

  });

});

function expectErrorMessage(id, expectedErrorMessage) {
  it(id, function() {

    // when
    const errorMessage = getErrorMessage(id);

    // then
    expect(errorMessage).to.equal(expectedErrorMessage);
  });
}