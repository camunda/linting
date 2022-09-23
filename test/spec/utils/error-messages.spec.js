import { expect } from 'chai';

import { getErrorMessage } from '../../../lib/utils/error-messages';

import { createElement } from '../../helper';

import {
  getLintError,
  getLintErrors
} from './lint-helper';

describe('utils/error-messages', function() {

  describe('#getErrorMessage', function() {

    describe('element type not allowed', function() {

      it('should adjust (undefined task)', async function() {

        // given
        const node = createElement('bpmn:Task');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report, 'Camunda Fox');

        // then
        expect(errorMessage).to.equal('An <Undefined Task> is not supported by Camunda Fox');
      });


      it('should adjust (undefined intermediate catch event)', async function() {

        // given
        const node = createElement('bpmn:IntermediateCatchEvent');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report, 'Camunda Fox');

        // then
        expect(errorMessage).to.equal('An <Undefined Intermediate Catch Event> is not supported by Camunda Fox');
      });

    });


    describe('extension element not allowed', function() {

      it('should adjust (business rule task with called decision)', async function() {

        // given
        const node = createElement('bpmn:BusinessRuleTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:CalledDecision')
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

        const { camundaCloud11: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

        const report = await getLintError(node, rule, config);

        // when
        const errorMessage = getErrorMessage(report, 'Camunda Fox');

        // then
        expect(errorMessage).to.equal('A <Business Rule Task> with <Implementation: DMN decision> is not supported by Camunda Fox');
      });


      it('should adjust (zeebe:Properties)', async function() {

        // given
        const node = createElement('bpmn:ServiceTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:Properties')
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-zeebe-properties');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report, 'Camunda Fox');

        // then
        expect(errorMessage).to.equal('A <Service Task> with <Extension properties> is not supported by Camunda Fox');
      });

    });


    describe('extension element required', function() {

      it('should adjust (called element)', async function() {

        // given
        const node = createElement('bpmn:CallActivity');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-element');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Call Activity> must have a defined <Called element>');
      });


      it('should adjust (loop characteristics)', async function() {

        // given
        const node = createElement('bpmn:ServiceTask', {
          loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/loop-characteristics');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Service Task> with <Multi-instance marker> must have a defined <Input collection>');
      });


      it('should adjust (subscription)', async function() {

        // given
        const node = createElement('bpmn:ReceiveTask', {
          messageRef: createElement('bpmn:Message')
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/subscription');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Receive Task> with <Message Reference> must have a defined <Subscription correlation key>');
      });


      it('should adjust (task definition)', async function() {

        // given
        const node = createElement('bpmn:ServiceTask');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

        const { camundaCloud10: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

        const report = await getLintError(node, rule, config);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Service Task> must have a <Task definition type>');
      });


      it('should adjust (called decision and task definition)', async function() {

        // given
        const node = createElement('bpmn:BusinessRuleTask');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

        const { camundaCloud13: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

        const report = await getLintError(node, rule, config);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Business Rule Task> must have a defined <Implementation>');
      });

    });


    describe('property dependend required', function() {

      it('should adjust (output collection)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Service Task> with <Multi-instance marker> and defined <Output element> must have a defined <Output collection>');
      });


      it('should adjust (output element)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Service Task> with <Multi-instance marker> and defined <Output collection> must have a defined <Output element>');
      });

    });


    describe('property not allowed', function() {

      describe('modeler template', function() {

        it('should adjust (desktop modeler)', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            modelerTemplate: 'foo'
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-template');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Fox', 'desktop');

          // then
          expect(errorMessage).to.equal('A <Template Service Task> is not supported by Camunda Fox');
        });


        it('should adjust (web modeler)', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            modelerTemplate: 'foo'
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-template');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Fox', 'web');

          // then
          expect(errorMessage).to.equal('A <Connector Service Task> is not supported by Camunda Fox');
        });

      });


      it('inclusive gateway (incoming)', async function() {

        // given
        const node = createElement('bpmn:InclusiveGateway', {
          incoming: [
            createElement('bpmn:SequenceFlow'),
            createElement('bpmn:SequenceFlow')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/inclusive-gateway');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report, 'Camunda Fox');

        // then
        expect(errorMessage).to.equal('An <Inclusive Gateway> with more than one incoming <Sequence Flow> is not supported by Camunda Fox');
      });

    });


    describe('property required', function() {

      it('should adjust (decision ID)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Business Rule Task> with <Implementation: DMN decision> must have a defined <Called decision ID>');
      });


      it('should adjust (result variable)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Business Rule Task> with <Implementation: DMN decision> must have a defined <Result variable>');
      });


      it('should adjust (task definition type)', async function() {

        // given
        const node = createElement('bpmn:BusinessRuleTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:TaskDefinition')
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition');

        const { camundaCloud13: config } = await import('bpmnlint-plugin-camunda-compat/rules/called-decision-or-task-definition/config');

        const report = await getLintError(node, rule, config);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Business Rule Task> with <Implementation: Job worker> must have a defined <Task definition type>');
      });


      it('should adjust (process ID)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Call Activity> must have a defined <Called element>');
      });


      it('should adjust (error code)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('An <Error End Event> with <Error Reference> must have a defined <Error code>');
      });


      it('should adjust (event definitions)', async function() {

        // given
        const node = createElement('bpmn:IntermediateThrowEvent');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

        const { camundaCloud10: config } = await import('bpmnlint-plugin-camunda-compat/rules/element-type/config');

        const report = await getLintError(node, rule, config);

        // when
        const errorMessage = getErrorMessage(report, 'Camunda Fox');

        // then
        expect(errorMessage).to.equal('An <Undefined Intermediate Throw Event> is not supported by Camunda Fox');
      });


      it('should adjust (input collection)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Service Task> with <Multi-instance marker> must have a defined <Input collection>');
      });


      it('should adjust (message name)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Message Intermediate Catch Event> with <Message Reference> must have a defined <Name>');
      });


      it('should adjust (correlation key)', async function() {

        // given
        const node = createElement('bpmn:IntermediateCatchEvent', {
          eventDefinitions: [
            createElement('bpmn:MessageEventDefinition', {
              messageRef: createElement('bpmn:Message', {
                name: 'foo',
                extensionElements: createElement('bpmn:ExtensionElements', {
                  values: [
                    createElement('zeebe:Subscription')
                  ]
                })
              })
            })
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/subscription');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Message Intermediate Catch Event> with <Message Reference> must have a defined <Subscription correlation key>');
      });


      it('should adjust (task definition type)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Service Task> with <Implementation: Job worker> must have a defined <Task definition type>');
      });


      it('should adjust (error ref)', async function() {

        // given
        const node = createElement('bpmn:EndEvent', {
          eventDefinitions: [
            createElement('bpmn:ErrorEventDefinition')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('An <Error End Event> must have a defined <Error Reference>');
      });


      it('should adjust (message ref)', async function() {

        // given
        const node = createElement('bpmn:IntermediateCatchEvent', {
          eventDefinitions: [
            createElement('bpmn:MessageEventDefinition')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/message-reference');

        const report = await getLintError(node, rule);

        // when
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Message Intermediate Catch Event> must have a defined <Message Reference>');
      });


      it('should adjust (form key)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <User Task> with <Form type: Custom form key> must have a defined <Form key>');
      });


      it('should adjust (body)', async function() {

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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <User Task> with <Form type: Camunda forms> must have a defined <Form JSON configuration>');
      });


      it('should adjust (condition expression)', async function() {

        // given
        const node = createElement('bpmn:InclusiveGateway', {
          outgoing: [
            createElement('bpmn:SequenceFlow'),
            createElement('bpmn:SequenceFlow')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/inclusive-gateway');

        const reports = await getLintErrors(node, rule);

        // assume
        expect(reports).to.have.length(2);

        // when
        const errorMessages = reports.map(getErrorMessage);

        // then
        errorMessages.forEach(errorMessage => {
          expect(errorMessage).to.equal('A <Sequence Flow> must have a defined <Condition expression> or be the default <Sequence Flow>');
        });
      });

    });


    describe('property type not allowed', function() {

      it('should adjust (event definitions)', async function() {

        // given
        const node = createElement('bpmn:IntermediateThrowEvent', {
          eventDefinitions: [
            createElement('bpmn:MessageEventDefinition')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

        const { camundaCloud10: config } = await import('bpmnlint-plugin-camunda-compat/rules/element-type/config');

        const report = await getLintError(node, rule, config);

        // when
        const errorMessage = getErrorMessage(report, 'Camunda Fox');

        // then
        expect(errorMessage).to.equal('A <Message Intermediate Throw Event> is not supported by Camunda Fox');
      });

    });


    describe('property value duplicated', function() {

      it('should adjust (two headers with same key)', async function() {

        // given
        const node = createElement('bpmn:ServiceTask', {
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
        const errorMessage = getErrorMessage(report);

        // then
        expect(errorMessage).to.equal('A <Service Task> with two or more <Headers> with the same <Key> (foo) is not supported');
      });

    });

  });

});