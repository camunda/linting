import { expect } from 'chai';

import {
  getErrorMessage,
  getExecutionPlatformLabel
} from '../../../lib/utils/error-messages';

import {
  createElement,
  createElementCamundaPlatform
} from '../../helper';

import {
  getLintError,
  getLintErrors
} from './lint-helper';

describe('utils/error-messages', function() {

  describe('#getErrorMessage', function() {

    it('should return original error messsage', async function() {

      // given
      const report = {
        id: 'Task_1',
        message: 'foo'
      };

      // when
      const errorMessage = getErrorMessage(report);

      // then
      expect(errorMessage).to.equal('foo');
    });


    describe('Camunda Cloud (Camunda 8)', function() {

      describe('element type not allowed', function() {

        it('should adjust (undefined task)', async function() {

          // given
          const executionPlatformVersion = '1.0';

          const node = createElement('bpmn:Task');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('An <Undefined Task> is only supported by Camunda 8.2 or newer');
        });


        it('should adjust (complex gateway)', async function() {

          // given
          const executionPlatformVersion = '1.0';

          const node = createElement('bpmn:ComplexGateway');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <Complex Gateway> is not supported by Camunda 8 (Zeebe 1.0)');
        });


        it('should adjust (undefined intermediate catch event)', async function() {

          // given
          const executionPlatformVersion = '1.0';

          const node = createElement('bpmn:IntermediateCatchEvent');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('An <Undefined Intermediate Catch Event> is not supported by Camunda 8 (Zeebe 1.0)');
        });


        it('should adjust (undefined intermediate throw event)', async function() {

          // given
          const executionPlatformVersion = '1.0';

          const node = createElement('bpmn:IntermediateThrowEvent');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('An <Undefined Intermediate Throw Event> is only supported by Camunda 8 (Zeebe 1.1) or newer');
        });


        it('should adjust (message intermediate throw event)', async function() {

          // given
          const executionPlatformVersion = '1.0';

          const node = createElement('bpmn:IntermediateThrowEvent', {
            eventDefinitions: [
              createElement('bpmn:MessageEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <Message Intermediate Throw Event> is only supported by Camunda 8 (Zeebe 1.2) or newer');
        });


        it('should adjust (business rule task)', async function() {

          // given
          const executionPlatformVersion = '1.0';

          const node = createElement('bpmn:BusinessRuleTask');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <Business Rule Task> is only supported by Camunda 8 (Zeebe 1.1) or newer');
        });


        it('should adjust (terminate end event)', async function() {

          // given
          const executionPlatformVersion = '1.0';

          const node = createElement('bpmn:EndEvent', {
            eventDefinitions: [
              createElement('bpmn:TerminateEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/element-type');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <Terminate End Event> is only supported by Camunda 8.1 or newer');
        });

      });


      describe('element collapsed not allowed', function() {

        it('should adjust (subprocess)', async function() {

          // given
          const di = createElement('bpmndi:BPMNShape', {
            bpmnElement: createElement('bpmn:SubProcess'),
            isExpanded: false
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/collapsed-subprocess');

          const report = await getLintError(di, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Sub Process> must be expanded');
        });


        it('should adjust (ad-hoc subprocess)', async function() {

          // given
          const di = createElement('bpmndi:BPMNShape', {
            bpmnElement: createElement('bpmn:AdHocSubProcess'),
            isExpanded: false
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/collapsed-subprocess');

          const report = await getLintError(di, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('An <Ad Hoc Sub Process> must be expanded');
        });

      });


      describe('extension element not allowed', function() {

        it('should adjust (business rule task with called decision)', async function() {

          // given
          const executionPlatformVersion = '1.1';

          const node = createElement('bpmn:BusinessRuleTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:CalledDecision')
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <Business Rule Task> with <Implementation: DMN decision> is only supported by Camunda 8 (Zeebe 1.3) or newer');
        });


        it('should adjust (zeebe:Properties)', async function() {

          // given
          const executionPlatformVersion = '1.0';

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
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <Service Task> with <Extension properties> is only supported by Camunda 8.1 or newer');
        });


        it('should adjust (script task with zeebe:Script)', async function() {

          // given
          const executionPlatformVersion = '1.1';

          const node = createElement('bpmn:ScriptTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:Script')
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <Script Task> with <Implementation: FEEL expression> is only supported by Camunda 8.2 or newer');
        });


        it('should adjust (user task with zeebe:TaskSchedule)', async function() {

          // given
          const executionPlatformVersion = '8.1';

          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskSchedule', {
                  dueDate: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-task-schedule');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <User Task> with <Due date> or <Follow up date> is only supported by Camunda 8.2 or newer');
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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Service Task> must have a <Task definition type>');
        });


        it('should adjust (called decision and task definition)', async function() {

          // given
          const node = createElement('bpmn:BusinessRuleTask');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '1.3' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Business Rule Task> must have a defined <Implementation>');
        });


        it('should adjust (script and task definition)', async function() {

          // given
          const node = createElement('bpmn:ScriptTask');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '8.2' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Script Task> must have a defined <Implementation>');
        });

      });


      describe('property dependent required', function() {

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
            const errorMessage = getErrorMessage(report, 'Camunda Cloud', '1.0', 'desktop');

            // then
            expect(errorMessage).to.equal('A <Template Service Task> is only supported by Camunda 8.0 or newer');
          });


          it('should adjust (web modeler)', async function() {

            // given
            const node = createElement('bpmn:ServiceTask', {
              modelerTemplate: 'foo'
            });

            const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-template');

            const report = await getLintError(node, rule);

            // when
            const errorMessage = getErrorMessage(report, 'Camunda Cloud', '1.0', 'web');

            // then
            expect(errorMessage).to.equal('A <Connector Service Task> is only supported by Camunda 8.0 or newer');
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
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', '1.0');

          // then
          expect(errorMessage).to.equal('An <Inclusive Gateway> with more than one incoming <Sequence Flow> is not supported by Camunda 8 (Zeebe 1.0)');
        });


        it('should adjust (candidate users)', async function() {

          // given
          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:AssignmentDefinition', {
                  candidateUsers: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-candidate-users');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', '1.0');

          // then
          expect(errorMessage).to.equal('A <User Task> with defined <Candidate users> is only supported by Camunda 8.2 or newer');
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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '1.3' });

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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '1.3' });

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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '1.3' });

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


        it('should adjust (error code, catch event)', async function() {

          // given
          const executionPlatformVersion = '8.1';

          const node = createElement('bpmn:BoundaryEvent', {
            eventDefinitions: [
              createElement('bpmn:ErrorEventDefinition', {
                errorRef: createElement('bpmn:Error')
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('An <Error Boundary Event> without defined <Error code> is only supported by Camunda 8.2 or newer');
        });


        it('should adjust (error code, throw event)', async function() {

          // given
          const node = createElement('bpmn:EndEvent', {
            eventDefinitions: [
              createElement('bpmn:ErrorEventDefinition', {
                errorRef: createElement('bpmn:Error')
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

          const report = await getLintError(node, rule, { version: '8.1' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('An <Error End Event> with <Error Reference> must have a defined <Error code>');
        });


        it('should adjust (escalation code)', async function() {

          // given
          const node = createElement('bpmn:EndEvent', {
            eventDefinitions: [
              createElement('bpmn:EscalationEventDefinition', {
                escalationRef: createElement('bpmn:Escalation')
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/escalation-reference');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('An <Escalation End Event> with <Escalation Reference> must have a defined <Escalation code>');
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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Service Task> with <Implementation: Job worker> must have a defined <Task definition type>');
        });


        it('should adjust (error ref, catch event)', async function() {

          // given
          const executionPlatformVersion = '8.1';

          const node = createElement('bpmn:BoundaryEvent', {
            eventDefinitions: [
              createElement('bpmn:ErrorEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('An <Error Boundary Event> without defined <Error Reference> is only supported by Camunda 8.2 or newer');
        });


        it('should adjust (error ref, throw event)', async function() {

          // given
          const node = createElement('bpmn:EndEvent', {
            eventDefinitions: [
              createElement('bpmn:ErrorEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/error-reference');

          const report = await getLintError(node, rule, { version: '8.1' });

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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/sequence-flow-condition');

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


        it('should adjust (timer type)', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            cancelActivity: false,
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/timer');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Timer Boundary Event> must have a defined <Timer type>');
        });


        it('should adjust (timer duration)', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/timer');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Timer Boundary Event> must have a defined <Timer duration>');
        });


        it('should adjust (time cycle)', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            cancelActivity: false,
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeCycle: createElement('bpmn:FormalExpression')
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/timer');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Timer Boundary Event> must have a defined <Timer value>');
        });


        it('should adjust (script expression)', async function() {

          // given
          const node = createElement('bpmn:ScriptTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:Script', {
                  resultVariable: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '8.2' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Script Task> with <Implementation: FEEL expression> must have a defined <FEEL expression>');
        });


        it('should adjust (result variable)', async function() {

          // given
          const node = createElement('bpmn:ScriptTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:Script', {
                  expression: '=foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '8.2' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Script Task> with <Implementation: FEEL expression> must have a defined <Result variable>');
        });


        it('should adjust (task definition type)', async function() {

          // given
          const node = createElement('bpmn:ScriptTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskDefinition')
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/implementation');

          const report = await getLintError(node, rule, { version: '8.2' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Script Task> with <Implementation: Job worker> must have a defined <Task definition type>');
        });

      });


      describe('expression value not allowed', function() {

        it('should adjust (time cycle)', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            cancelActivity: false,
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeCycle: createElement('bpmn:FormalExpression', { body: 'invalid' })
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/timer');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Timer Boundary Event> <Time cycle> must be an expression, an ISO 8601 repeating interval, or a cron expression (cron requires Camunda Platform 8.1 or newer)');
        });


        it('should adjust (time date)', async function() {

          // given
          const node = createElement('bpmn:StartEvent', {
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeDate: createElement('bpmn:FormalExpression', { body: 'invalid' })
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/timer');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Timer Start Event> <Time date> must be an expression, or an ISO 8601 date');
        });


        it('should adjust (time duration)', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            cancelActivity: false,
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeDuration: createElement('bpmn:FormalExpression', { body: 'invalid' })
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/timer');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Timer Boundary Event> <Time duration> must be an expression, or an ISO 8601 interval');
        });


        it('should adjust (due date)', async function() {

          // given
          const executionPlatformVersion = '8.2';

          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskSchedule', {
                  dueDate: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/task-schedule');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <User Task> <Due date> must be an ISO 8601 date');
        });


        it('should adjust (follow up date)', async function() {

          // given
          const executionPlatformVersion = '8.2';

          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskSchedule', {
                  followUpDate: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/task-schedule');

          const report = await getLintError(node, rule, { version: executionPlatformVersion });

          // when
          const errorMessage = getErrorMessage(report, 'Camunda Cloud', executionPlatformVersion);

          // then
          expect(errorMessage).to.equal('A <User Task> <Follow up date> must be an ISO 8601 date');
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


      describe('property value required', function() {

        it('should adjust (is executable, process)', async function() {

          // given
          const node = createElement('bpmn:Definitions', {
            rootElements: [
              createElement('bpmn:Process', {
                isExecutable: false
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/executable-process');

          const report = await getLintError(node, rule);

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Process> must be <Executable>');
        });

      });


      describe('expression not allowed', function() {

        it('should adjust (error code, catch event)', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            eventDefinitions: [
              createElement('bpmn:ErrorEventDefinition', {
                errorRef: createElement('bpmn:Error', {
                  errorCode: '=code'
                })
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-expression');

          const report = await getLintError(node, rule, { version: '8.2' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('Error code used in a catch event must be a static value');
        });


        it('should NOT adjust (error code, throw event)', async function() {

          // given
          const node = createElement('bpmn:EndEvent', {
            eventDefinitions: [
              createElement('bpmn:ErrorEventDefinition', {
                errorRef: createElement('bpmn:Error', {
                  errorCode: '=code'
                })
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-expression');

          const report = await getLintError(node, rule, { version: '8.1' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.eql(report.message);
        });


        it('should adjust (escalation code, catch event)', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            eventDefinitions: [
              createElement('bpmn:EscalationEventDefinition', {
                escalationRef: createElement('bpmn:Escalation', {
                  escalationCode: '=code'
                })
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/no-expression');

          const report = await getLintError(node, rule, { version: '8.2' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('Escalation code used in a catch event must be a static value');
        });

      });


      it('should adjust (is executable, collaboration)', async function() {

        // given
        const process1 = createElement('bpmn:Process', {
          isExecutable: false
        });

        const process2 = createElement('bpmn:Process', {
          isExecutable: false
        });

        const node = createElement('bpmn:Definitions', {
          rootElements: [
            createElement('bpmn:Collaboration', {
              participants: [
                createElement('bpmn:Participant', {
                  processRef: process1
                }),
                createElement('bpmn:Participant', {
                  processRef: process2
                })
              ]
            }),
            process1,
            process2
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/executable-process');

        const reports = await getLintErrors(node, rule);

        // when
        const errorMessages = reports.map(getErrorMessage);

        // then
        errorMessages.forEach(errorMessage => {
          expect(errorMessage).to.equal('One <Process> must be <Executable>');
        });
      });

    });


    describe('Camunda Platform (Camunda 7)', function() {

      describe('property required', function() {

        it('should adjust (history time to live)', async function() {

          // given
          const node = createElementCamundaPlatform('bpmn:Process');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/history-time-to-live');

          const report = await getLintError(node, rule, { version: '7.19' });

          // when
          const errorMessage = getErrorMessage(report);

          // then
          expect(errorMessage).to.equal('A <Process> must have a defined <History time to live>');
        });

      });

    });

  });

  describe('#getExecutionPlatformLabel', function() {

    // given
    // [ executionPlatform, executionPlatformVersion, expectedLabel ]
    const labelCombinations = [
      [ 'Camunda Cloud', '1.0', 'Camunda 8 (Zeebe 1.0)' ],
      [ 'Camunda Cloud', '1.0.0', 'Camunda 8 (Zeebe 1.0)' ],
      [ 'Camunda Cloud', '1.1', 'Camunda 8 (Zeebe 1.1)' ],
      [ 'Camunda Cloud', '1.2', 'Camunda 8 (Zeebe 1.2)' ],
      [ 'Camunda Cloud', '1.3', 'Camunda 8 (Zeebe 1.3)' ],
      [ 'Camunda Cloud', '8.0', 'Camunda 8.0' ],
      [ 'Camunda Cloud', '8.1', 'Camunda 8.1' ],
      [ 'Camunda Cloud', '8.15', 'Camunda 8.15' ],
      [ 'Camunda Platform', '7.15', 'Camunda Platform 7.15' ],
      [ 'Camunda Fox', 'Foobar', 'Camunda Fox Foobar' ]
    ];

    labelCombinations.forEach(([ executionPlatform, executionPlatformVersion, expectedLabel ]) => {

      it(`should return label for ${expectedLabel}`, function() {

        // when
        const label = getExecutionPlatformLabel(executionPlatform, executionPlatformVersion);

        // then
        expect(label).to.equal(expectedLabel);

      });

    });

  });

});