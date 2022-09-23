import { expect } from 'chai';

import { Linter } from '../../..';

import {
  getEntryIds,
  getErrorMessage,
  getErrors
} from '../../../lib/utils/properties-panel';

import {
  createElement,
  createModdle
} from '../../helper';

import {
  getLintError,
  getLintErrors
} from './lint-helper';

import propertiesPanelXML from './properties-panel.bpmn';

describe('utils/properties-panel', function() {

  describe('#getEntryId and #getErrorMessage', function() {

    it('called-decision-or-task-definition - Implementation', async function() {

      // given
      const node = createElement('bpmn:BusinessRuleTask');

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

      const { camundaCloud13: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

      const report = await getLintError(node, rule, config);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'businessRuleImplementation' ]);

      expectErrorMessage(entryIds[ 0 ], 'Implementation must be defined.');
    });


    it('error-reference - Global error reference', async function() {

      // given
      const node = createElement('bpmn:EndEvent', {
        eventDefinitions: [
          createElement('bpmn:ErrorEventDefinition')
        ]
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

      const report = await getLintError(node, rule);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'errorRef' ]);

      expectErrorMessage(entryIds[ 0 ], 'Global error reference must be defined.');
    });


    it('message-reference - Global message reference', async function() {

      // given
      const node = createElement('bpmn:IntermediateCatchEvent', {
        eventDefinitions: [
          createElement('bpmn:MessageEventDefinition')
        ]
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/message-reference');

      const report = await getLintError(node, rule);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'messageRef' ]);

      expectErrorMessage(entryIds[ 0 ], 'Global message reference must be defined.');
    });


    it('called-decision-or-task-definition - Decision ID', async function() {

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

      const { camundaCloud13: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

      const report = await getLintError(node, rule, config);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'decisionId' ]);

      expectErrorMessage(entryIds[ 0 ], 'Decision ID must be defined.');
    });


    it('called-decision-or-task-definition - Result variable', async function() {

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

      const { camundaCloud13: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

      const report = await getLintError(node, rule, config);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'resultVariable' ]);

      expectErrorMessage(entryIds[ 0 ], 'Result variable must be defined.');
    });


    it('error-reference - Code', async function() {

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
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'errorCode' ]);

      expectErrorMessage(entryIds[ 0 ], 'Code must be defined.');
    });


    it('message-reference - Name', async function() {

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
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'messageName' ]);

      expectErrorMessage(entryIds[ 0 ], 'Name must be defined.');
    });


    describe('loop-characteristics', function() {

      it('Input collection (no loop characteristics)', async function() {

        // given
        const node = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/loop-characteristics');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'multiInstance-inputCollection' ]);

        expectErrorMessage(entryIds[ 0 ], 'Input collection must be defined.');
      });


      it('Input collection (no input collection)', async function() {

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
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'multiInstance-inputCollection' ]);

        expectErrorMessage(entryIds[ 0 ], 'Input collection must be defined.');
      });

    });


    it('loop-characteristics - Output collection', async function() {

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
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'multiInstance-outputCollection' ]);

      expectErrorMessage(entryIds[ 0 ], 'Output collection must be defined.');
    });


    it('loop-characteristics - Output element', async function() {

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
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'multiInstance-outputElement' ]);

      expectErrorMessage(entryIds[ 0 ], 'Output element must be defined.');
    });


    describe('called-element', function() {

      it('Process ID (no called element)', async function() {

        // given
        const node = createElement('bpmn:CallActivity');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-element');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'targetProcessId' ]);

        expectErrorMessage(entryIds[ 0 ], 'Process ID must be defined.');
      });


      it('Process ID (no process ID)', async function() {

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
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'targetProcessId' ]);

        expectErrorMessage(entryIds[ 0 ], 'Process ID must be defined.');
      });

    });


    describe('called-decision-or-task-definition', function() {

      it('Type (no task definition)', async function() {

        // given
        const node = createElement('bpmn:ServiceTask');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

        const { camundaCloud10: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

        const report = await getLintError(node, rule, config);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'taskDefinitionType' ]);

        expectErrorMessage(entryIds[ 0 ], 'Type must be defined.');
      });


      it('Type (no type)', async function() {

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
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'taskDefinitionType' ]);

        expectErrorMessage(entryIds[ 0 ], 'Type must be defined.');
      });

    });


    describe('subscription', function() {

      it('Subscription correlation key (no subscription)', async function() {

        // given
        const node = createElement('bpmn:ReceiveTask', {
          messageRef: createElement('bpmn:Message')
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/subscription');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'messageSubscriptionCorrelationKey' ]);

        expectErrorMessage(entryIds[ 0 ], 'Subscription correlation key must be defined.');
      });


      it('Subscription correlation key (no correlation key)', async function() {

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
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'messageSubscriptionCorrelationKey' ]);

        expectErrorMessage(entryIds[ 0 ], 'Subscription correlation key must be defined.');
      });

    });


    it('user-task-form - Form key', async function() {

      // given
      const node = createElement('bpmn:UserTask', {
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:FormDefinition')
          ]
        })
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/user-task-form');

      const report = await getLintError(node, rule);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'customFormKey' ]);

      expectErrorMessage(entryIds[ 0 ], 'Form key must be defined.');
    });


    it('user-task-form - Form JSON configuration', async function() {

      // given
      const process = createElement('bpmn:Process', {
        flowElements: [
          createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:FormDefinition', {
                  formKey: 'camunda-forms:bpmn:userTaskForm_1'
                })
              ]
            })
          })
        ],
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:UserTaskForm', {
              id: 'userTaskForm_1'
            })
          ]
        })
      });

      const node = process.get('flowElements')[ 0 ];

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/user-task-form');

      const report = await getLintError(node, rule);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([ 'formConfiguration' ]);

      expectErrorMessage(entryIds[ 0 ], 'Form JSON configuration must be defined.');
    });


    it('duplicate-task-headers - Key', async function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        id: 'ServiceTask_1',
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:TaskHeaders', {
              values: [
                createElement('zeebe:Header', { key: 'foo' }),
                createElement('zeebe:Header', { key: 'foo' })
              ]
            })
          ]
        })
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/duplicate-task-headers');

      const report = await getLintError(node, rule);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([
        'ServiceTask_1-header-0-key',
        'ServiceTask_1-header-1-key'
      ]);

      expectErrorMessage(entryIds[ 0 ], 'Must be unique.');
    });


    it('no-zeebe-properties - Name', async function() {

      // given
      const node = createElement('bpmn:ServiceTask', {
        id: 'ServiceTask_1',
        extensionElements: createElement('bpmn:ExtensionElements', {
          values: [
            createElement('zeebe:Properties', {
              properties: [
                createElement('zeebe:Property'),
                createElement('zeebe:Property')
              ]
            })
          ]
        })
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-zeebe-properties');

      const report = await getLintError(node, rule);

      // when
      const entryIds = getEntryIds(report);

      // then
      expect(entryIds).to.eql([
        'ServiceTask_1-extensionProperty-0-name',
        'ServiceTask_1-extensionProperty-1-name'
      ]);

      expectErrorMessage(entryIds[ 0 ], 'Not supported.');
    });


    it('inclusive-gateway (no condition expression)', async function() {

      // given
      const node = createElement('bpmn:InclusiveGateway', {
        outgoing: [
          createElement('bpmn:SequenceFlow', {
            id: 'SequenceFlow_1'
          }),
          createElement('bpmn:SequenceFlow', {
            id: 'SequenceFlow_2'
          })
        ]
      });

      const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/inclusive-gateway');

      const reports = await getLintErrors(node, rule);

      // when
      reports.forEach(report => {
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'conditionExpression' ]);

        expectErrorMessage(entryIds[ 0 ], 'Condition expression must be defined.');
      });
    });

  });


  describe('#getErrors', function() {

    it('should return errors', async function() {

      // given
      const linter = new Linter();

      const { root } = await createModdle(propertiesPanelXML);

      const reports = await linter.lint(root);

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

});

function expectErrorMessage(id, expectedErrorMessage) {

  // when
  const errorMessage = getErrorMessage(id);

  // then
  expect(errorMessage).to.equal(expectedErrorMessage);
}