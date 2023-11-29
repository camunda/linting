import { Linter } from '../../..';

import {
  getEntryIds,
  getErrorMessage,
  getErrors
} from '../../../lib/utils/properties-panel';

import {
  createElement,
  createElementCamundaPlatform,
  createModdle,
  createModdleCamundaPlatform
} from '../../helper';

import {
  getLintError,
  getLintErrors
} from './lint-helper';

import propertiesPanelXML from './properties-panel.bpmn';
import propertiesPanelInfoXML from './properties-panel-info.bpmn';
import propertiesPanelPlatformXML from './properties-panel-platform.bpmn';

describe('utils/properties-panel', function() {

  describe('Camunda Cloud (Camunda 8)', function() {

    describe('#getEntryId and #getErrorMessage', function() {

      it('should keep original entryIds', async function() {

        // given
        const node = createElement('bpmn:Process');

        const rule = () => ({
          check: (node, reporter) => {
            reporter.report(
              node.id,
              'My Custom Message',
              {
                propertiesPanel: {
                  entryIds: [ 'myCustomEntry' ]
                }
              }
            );
          }
        });

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'myCustomEntry' ]);
      });


      it('executable-process - Executable (process)', async function() {

        // given
        const node = createElement('bpmn:Definitions', {
          rootElements: [
            createElement('bpmn:Process', {
              isExecutable: false
            })
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/executable-process');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'isExecutable' ]);

        expectErrorMessage(entryIds[ 0 ], 'Process must be executable.', report);
      });


      it('executable-process - Executable (collaboration)', async function() {

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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/executable-process');

        const reports = await getLintErrors(node, rule);

        // when
        reports.forEach(report => {
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'isExecutable' ]);

          expectErrorMessage(entryIds[ 0 ], 'One process must be executable.', report);
        });
      });


      it('implementation (Business Rule Task) - Implementation', async function() {

        // given
        const node = createElement('bpmn:BusinessRuleTask');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

        const report = await getLintError(node, rule, { version: '1.3' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'businessRuleImplementation' ]);

        expectErrorMessage(entryIds[ 0 ], 'Implementation must be defined.', report);
      });


      it('implementation (Script Task) - Implementation', async function() {

        // given
        const node = createElement('bpmn:ScriptTask');

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

        const report = await getLintError(node, rule, { version: '8.2' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'scriptImplementation' ]);

        expectErrorMessage(entryIds[ 0 ], 'Implementation must be defined.', report);
      });


      it('error-reference - Global error reference', async function() {

        // given
        const node = createElement('bpmn:EndEvent', {
          eventDefinitions: [
            createElement('bpmn:ErrorEventDefinition')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/error-reference');

        const report = await getLintError(node, rule, { version: '8.1' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'errorRef' ]);

        expectErrorMessage(entryIds[ 0 ], 'Global error reference must be defined.', report);
      });


      it('escalation-reference - Global escalation reference', async function() {

        // given
        const node = createElement('bpmn:EndEvent', {
          eventDefinitions: [
            createElement('bpmn:EscalationEventDefinition')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/escalation-reference');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'escalationRef' ]);

        expectErrorMessage(entryIds[ 0 ], 'Global escalation reference must be defined.', report);
      });


      it('message-reference - Global message reference', async function() {

        // given
        const node = createElement('bpmn:IntermediateCatchEvent', {
          eventDefinitions: [
            createElement('bpmn:MessageEventDefinition')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/message-reference');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'messageRef' ]);

        expectErrorMessage(entryIds[ 0 ], 'Global message reference must be defined.', report);
      });


      it('signal-reference - Global signal reference', async function() {

        // given
        const node = createElement('bpmn:StartEvent', {
          eventDefinitions: [
            createElement('bpmn:SignalEventDefinition')
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/signal-reference');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'signalRef' ]);

        expectErrorMessage(entryIds[ 0 ], 'Global signal reference must be defined.', report);
      });


      it('implementation (DMN decision) - Decision ID', async function() {

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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

        const report = await getLintError(node, rule, { version: '1.3' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'decisionId' ]);

        expectErrorMessage(entryIds[ 0 ], 'Decision ID must be defined.', report);
      });


      it('implementation (DMN decision) - Result variable', async function() {

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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

        const report = await getLintError(node, rule, { version: '1.3' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'resultVariable' ]);

        expectErrorMessage(entryIds[ 0 ], 'Result variable must be defined.', report);
      });


      it('implementation (FEEL expression) - FEEL expression', async function() {

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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

        const report = await getLintError(node, rule, { version: '8.2' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'scriptExpression' ]);

        expectErrorMessage(entryIds[ 0 ], 'FEEL expression must be defined.', report);
      });


      it('implementation (FEEL expression) - Result variable', async function() {

        // given
        const node = createElement('bpmn:ScriptTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:Script', {
                expression: 'foo'
              })
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

        const report = await getLintError(node, rule, { version: '8.2' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'resultVariable' ]);

        expectErrorMessage(entryIds[ 0 ], 'Result variable must be defined.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/error-reference');

        const report = await getLintError(node, rule, { version: '8.1' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'errorCode' ]);

        expectErrorMessage(entryIds[ 0 ], 'Code must be defined.', report);
      });


      it('error-reference - Code as expression (throw event)', async function() {

        // given
        const node = createElement('bpmn:EndEvent', {
          eventDefinitions: [
            createElement('bpmn:ErrorEventDefinition', {
              errorRef: createElement('bpmn:Error', { errorCode: '=expression' })
            })
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-expression');

        const report = await getLintError(node, rule, { version: '8.1' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'errorCode' ]);

        expectErrorMessage(entryIds[ 0 ], 'Cannot be an expression.', report);
      });


      it('error-reference - Code as expression (catch event)', async function() {

        // given
        const node = createElement('bpmn:BoundaryEvent', {
          eventDefinitions: [
            createElement('bpmn:ErrorEventDefinition', {
              errorRef: createElement('bpmn:Error', { errorCode: '=expression' })
            })
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-expression');

        const report = await getLintError(node, rule, { version: '8.2' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'errorCode' ]);

        expectErrorMessage(entryIds[ 0 ], 'Cannot be an expression.', report);
      });


      it('escalation-reference - Code', async function() {

        // given
        const node = createElement('bpmn:EndEvent', {
          eventDefinitions: [
            createElement('bpmn:EscalationEventDefinition', {
              escalationRef: createElement('bpmn:Escalation')
            })
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/escalation-reference');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'escalationCode' ]);

        expectErrorMessage(entryIds[ 0 ], 'Code must be defined.', report);
      });


      it('escalation-reference - Code as expression in a catch event', async function() {

        // given
        const node = createElement('bpmn:BoundaryEvent', {
          eventDefinitions: [
            createElement('bpmn:EscalationEventDefinition', {
              escalationRef: createElement('bpmn:Escalation', { escalationCode: '=expression' })
            })
          ]
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-expression');

        const report = await getLintError(node, rule, { version: '8.2' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'escalationCode' ]);

        expectErrorMessage(entryIds[ 0 ], 'Cannot be an expression.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/message-reference');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'messageName' ]);

        expectErrorMessage(entryIds[ 0 ], 'Name must be defined.', report);
      });


      describe('loop-characteristics', function() {

        it('Input collection (no loop characteristics)', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics')
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/loop-characteristics');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'multiInstance-inputCollection' ]);

          expectErrorMessage(entryIds[ 0 ], 'Input collection must be defined.', report);
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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/loop-characteristics');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'multiInstance-inputCollection' ]);

          expectErrorMessage(entryIds[ 0 ], 'Input collection must be defined.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/loop-characteristics');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'multiInstance-outputCollection' ]);

        expectErrorMessage(entryIds[ 0 ], 'Output collection must be defined.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/loop-characteristics');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'multiInstance-outputElement' ]);

        expectErrorMessage(entryIds[ 0 ], 'Output element must be defined.', report);
      });


      describe('called-element', function() {

        it('Process ID (no called element)', async function() {

          // given
          const node = createElement('bpmn:CallActivity');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/called-element');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'targetProcessId' ]);

          expectErrorMessage(entryIds[ 0 ], 'Process ID must be defined.', report);
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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/called-element');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'targetProcessId' ]);

          expectErrorMessage(entryIds[ 0 ], 'Process ID must be defined.', report);
        });

      });


      describe('implementation', function() {

        it('Type (no task definition)', async function() {

          // given
          const node = createElement('bpmn:ServiceTask');

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'taskDefinitionType' ]);

          expectErrorMessage(entryIds[ 0 ], 'Type must be defined.', report);
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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/implementation');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'taskDefinitionType' ]);

          expectErrorMessage(entryIds[ 0 ], 'Type must be defined.', report);
        });

      });


      describe('subscription', function() {

        it('Subscription correlation key (no subscription)', async function() {

          // given
          const node = createElement('bpmn:ReceiveTask', {
            messageRef: createElement('bpmn:Message')
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/subscription');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'messageSubscriptionCorrelationKey' ]);

          expectErrorMessage(entryIds[ 0 ], 'Subscription correlation key must be defined.', report);
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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/subscription');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'messageSubscriptionCorrelationKey' ]);

          expectErrorMessage(entryIds[ 0 ], 'Subscription correlation key must be defined.', report);
        });

      });


      it('start-event-form - Form', async function() {

        // given
        const node = createElement('bpmn:StartEvent', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:FormDefinition')
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/start-event-form');

        const report = await getLintError(node, rule, { version: '1.0' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'formType' ]);
      });


      it('user-task-form - Form key (Camunda 8.3 and older)', async function() {

        // given
        const node = createElement('bpmn:UserTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:FormDefinition')
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/user-task-form');

        const report = await getLintError(node, rule, { version: '8.3' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'customFormKey' ]);

        expectErrorMessage(entryIds[ 0 ], 'Form key must be defined.', report);
      });


      it('user-task-form - Form key (Camunda 8.4 and newer)', async function() {

        // given
        const node = createElement('bpmn:UserTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:FormDefinition', {
                formKey: ''
              })
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/user-task-form');

        const report = await getLintError(node, rule, { version: '8.4' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'customFormKey' ]);

        expectErrorMessage(entryIds[ 0 ], 'Form key must be defined.', report);
      });


      it('user-task-form - Form ID (Camunda 8.3 and older)', async function() {

        // given
        const node = createElement('bpmn:UserTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:FormDefinition', {
                formId: ''
              })
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/user-task-form');

        const report = await getLintError(node, rule, { version: '8.3' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'formId' ]);

        expectErrorMessage(entryIds[ 0 ], 'Form ID not supported.', report);
      });


      it('user-task-form - Form ID (Camunda 8.4 and newer)', async function() {

        // given
        const node = createElement('bpmn:UserTask', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:FormDefinition', {
                formId: ''
              })
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/user-task-form');

        const report = await getLintError(node, rule, { version: '8.4' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'formId' ]);

        expectErrorMessage(entryIds[ 0 ], 'Form ID must be defined.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/user-task-form');

        const report = await getLintError(node, rule, { version: '8.2' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'formConfiguration' ]);

        expectErrorMessage(entryIds[ 0 ], 'Form JSON configuration must be defined.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/duplicate-task-headers');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([
          'ServiceTask_1-header-0-key',
          'ServiceTask_1-header-1-key'
        ]);

        expectErrorMessage(entryIds[ 0 ], 'Must be unique.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-zeebe-properties');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([
          'ServiceTask_1-extensionProperty-0-name',
          'ServiceTask_1-extensionProperty-1-name'
        ]);

        expectErrorMessage(entryIds[ 0 ], 'Not supported.', report);
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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/sequence-flow-condition');

        const reports = await getLintErrors(node, rule);

        // when
        reports.forEach(report => {
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'conditionExpression' ]);

          expectErrorMessage(entryIds[ 0 ], 'Condition expression must be defined.', report);
        });
      });


      describe('timer', function() {

        it('no type', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            cancelActivity: false,
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'timerEventDefinitionType' ]);

          expectErrorMessage(entryIds[ 0 ], 'Type must be defined.', report);
        });


        it('type not allowed', async function() {

          // given
          const node = createElement('bpmn:IntermediateCatchEvent', {
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeDate: createElement('bpmn:FormalExpression')
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'timerEventDefinitionType' ]);

          expectErrorMessage(entryIds[ 0 ], 'Type not supported.', report);
        });


        it('no time cycle value', async function() {

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

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'timerEventDefinitionValue' ]);

          expectErrorMessage(entryIds[ 0 ], 'Value must be defined.', report);
        });


        it('no time date value', async function() {

          // given
          const node = createElement('bpmn:StartEvent', {
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeDate: createElement('bpmn:FormalExpression')
              })
            ]
          });

          createElement('bpmn:Process', { flowElements: [ node ] });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'timerEventDefinitionValue' ]);

          expectErrorMessage(entryIds[ 0 ], 'Value must be defined.', report);
        });


        it('no time duration value', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            cancelActivity: false,
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeDuration: createElement('bpmn:FormalExpression')
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'timerEventDefinitionValue' ]);

          expectErrorMessage(entryIds[ 0 ], 'Value must be defined.', report);
        });


        describe('invalid time cycle value', async function() {

          it('< Camunda 8.1', async function() {

            // given
            const node = createElement('bpmn:BoundaryEvent', {
              attachedToRef: createElement('bpmn:Task'),
              cancelActivity: false,
              eventDefinitions: [
                createElement('bpmn:TimerEventDefinition', {
                  timeCycle: createElement('bpmn:FormalExpression', {
                    body: 'invalid'
                  })
                })
              ]
            });

            const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

            const report = await getLintError(node, rule, { version: '1.0' });

            // when
            const entryIds = getEntryIds(report);

            // then
            expect(entryIds).to.eql([ 'timerEventDefinitionValue' ]);

            expectErrorMessage(entryIds[ 0 ], 'Must be an expression, an ISO 8601 repeating interval, or a cron expression (cron only supported by Camunda 8.1 or newer).', report);
          });


          it('=> Camunda 8.1', async function() {

            // given
            const node = createElement('bpmn:BoundaryEvent', {
              attachedToRef: createElement('bpmn:Task'),
              cancelActivity: false,
              eventDefinitions: [
                createElement('bpmn:TimerEventDefinition', {
                  timeCycle: createElement('bpmn:FormalExpression', {
                    body: 'invalid'
                  })
                })
              ]
            });

            const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

            const report = await getLintError(node, rule, { version: '8.1' });

            // when
            const entryIds = getEntryIds(report);

            // then
            expect(entryIds).to.eql([ 'timerEventDefinitionValue' ]);

            expectErrorMessage(entryIds[ 0 ], 'Must be an expression, an ISO 8601 repeating interval, or a cron expression.', report);
          });

        });


        it('invalid time date value', async function() {

          // given
          const node = createElement('bpmn:StartEvent', {
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeDate: createElement('bpmn:FormalExpression', {
                  body: 'INVALID'
                })
              })
            ]
          });

          createElement('bpmn:Process', { flowElements: [ node ] });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'timerEventDefinitionValue' ]);

          expectErrorMessage(entryIds[ 0 ], 'Must be an expression, or an ISO 8601 date.', report);
        });


        it('invalid time duration value', async function() {

          // given
          const node = createElement('bpmn:BoundaryEvent', {
            attachedToRef: createElement('bpmn:Task'),
            cancelActivity: false,
            eventDefinitions: [
              createElement('bpmn:TimerEventDefinition', {
                timeDuration: createElement('bpmn:FormalExpression', {
                  body: 'INVALID'
                })
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/timer');

          const report = await getLintError(node, rule, { version: '1.0' });

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'timerEventDefinitionValue' ]);

          expectErrorMessage(entryIds[ 0 ], 'Must be an expression, or an ISO 8601 interval.', report);
        });

      });


      describe('FEEL', async function() {

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/feel');

        const INVALID_FEEL = '===';


        it('should return error for input mapping', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            id: 'ServiceTask_1',
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:IoMapping', {
                  inputParameters: [
                    createElement('zeebe:Input', {
                      source: INVALID_FEEL
                    })
                  ]
                })
              ]
            })
          });

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'ServiceTask_1-input-0-source' ]);
        });


        it('should return error for output mapping', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            id: 'ServiceTask_1',
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:IoMapping', {
                  outputParameters: [
                    createElement('zeebe:Output', {
                      source: INVALID_FEEL
                    })
                  ]
                })
              ]
            })
          });

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'ServiceTask_1-output-0-source' ]);
        });


        it('should return error for Task Headers', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            id: 'ServiceTask_1',
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskHeaders', {
                  values: [
                    createElement('zeebe:Header', {
                      value: INVALID_FEEL
                    })
                  ]
                })
              ]
            })
          });

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'ServiceTask_1-header-0-value' ]);
        });


        it('should return error for Extension Properties', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            id: 'ServiceTask_1',
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskHeaders', {
                  values: [
                    createElement('zeebe:Property', {
                      value: INVALID_FEEL
                    })
                  ]
                })
              ]
            })
          });

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'ServiceTask_1-extensionProperty-0-value' ]);
        });


        it('should return error for multi-instance properties', async function() {
          const node = createElement('bpmn:ServiceTask', {
            loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
              extensionElements: createElement('bpmn:ExtensionElements', {
                values: [
                  createElement('zeebe:LoopCharacteristics', {
                    inputCollection: INVALID_FEEL
                  })
                ]
              })
            })
          });

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'multiInstance-inputCollection' ]);

        });


        it('should return error for multi-instance completion condition', async function() {
          const node = createElement('bpmn:ServiceTask', {
            loopCharacteristics: createElement('bpmn:MultiInstanceLoopCharacteristics', {
              completionCondition: createElement('bpmn:FormalExpression', {
                body: INVALID_FEEL
              })
            })
          });

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'multiInstance-completionCondition' ]);
        });


        it('should return error for conditional flow', async function() {
          const node = createElement('bpmn:SequenceFlow', {
            conditionExpression: createElement('bpmn:FormalExpression', {
              body: INVALID_FEEL
            })
          });

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'conditionExpression' ]);
        });

      });


      it('user task - Candidate users', async function() {

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

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-candidate-users');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'assignmentDefinitionCandidateUsers' ]);

        expectErrorMessage(entryIds[ 0 ], 'Not supported.', report);
      });


      describe('user task - Due date and Follow up date', function() {

        it('user task - Due date', async function() {

          // given
          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskSchedule', {
                  dueDate: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/task-schedule');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'taskScheduleDueDate' ]);

          expectErrorMessage(entryIds[ 0 ], 'Must be an ISO 8601 date.', report);
        });


        it('user task - Follow up date', async function() {

          // given
          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskSchedule', {
                  followUpDate: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/task-schedule');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'taskScheduleFollowUpDate' ]);

          expectErrorMessage(entryIds[ 0 ], 'Must be an ISO 8601 date.', report);
        });


        it('user task - Due date not supported', async function() {

          // given
          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskSchedule', {
                  dueDate: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-task-schedule');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'taskScheduleDueDate' ]);

          expectErrorMessage(entryIds[ 0 ], 'Not supported.', report);
        });


        it('user task - Follow up date not supported', async function() {

          // given
          const node = createElement('bpmn:UserTask', {
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:TaskSchedule', {
                  followUpDate: 'foo'
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-task-schedule');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'taskScheduleFollowUpDate' ]);

          expectErrorMessage(entryIds[ 0 ], 'Not supported.', report);
        });

      });


      it('call activity - Propagate all variables', async function() {

        // given
        const node = createElement('bpmn:CallActivity', {
          extensionElements: createElement('bpmn:ExtensionElements', {
            values: [
              createElement('zeebe:CalledElement', {
                propagateAllParentVariables: false
              })
            ]
          })
        });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/no-propagate-all-parent-variables');

        const report = await getLintError(node, rule);

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'propagateAllParentVariables' ]);

        expectErrorMessage(entryIds[ 0 ], 'Not supported.', report);
      });


      describe('secret expression format deprecated', function() {

        it('Subscription correlation key', async function() {

          // given
          const node = createElement('bpmn:ReceiveTask', {
            messageRef: createElement('bpmn:Message', {
              extensionElements: createElement('bpmn:ExtensionElements', {
                values: [
                  createElement('zeebe:Subscription', {
                    correlationKey: 'secrets.'
                  })
                ]
              })
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/secrets');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'messageSubscriptionCorrelationKey' ]);

          expectNoErrorMessage(entryIds[ 0 ], report);
        });


        it('Input variable assignment value', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            id: 'ServiceTask_1',
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:IoMapping', {
                  inputParameters: [
                    createElement('zeebe:Input', {
                      source: 'secrets.'
                    })
                  ]
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/secrets');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'ServiceTask_1-input-0-source' ]);

          expectNoErrorMessage(entryIds[ 0 ], report);
        });


        it('Extension property value', async function() {

          // given
          const node = createElement('bpmn:ServiceTask', {
            id: 'ServiceTask_1',
            extensionElements: createElement('bpmn:ExtensionElements', {
              values: [
                createElement('zeebe:Properties', {
                  properties: [
                    createElement('zeebe:Property', {
                      value: 'secrets.'
                    })
                  ]
                })
              ]
            })
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/secrets');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'ServiceTask_1-extensionProperty-0-value' ]);

          expectNoErrorMessage(entryIds[ 0 ], report);
        });

      });


      describe('link event - Name', async function() {

        it('required', async function() {

          // given
          const node = createElement('bpmn:IntermediateCatchEvent', {
            eventDefinitions: [
              createElement('bpmn:LinkEventDefinition')
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/link-event');

          const report = await getLintError(node, rule);

          // when
          const entryIds = getEntryIds(report);

          // then
          expect(entryIds).to.eql([ 'linkName' ]);

          expectErrorMessage(entryIds[ 0 ], 'Must be defined.', report);
        });


        it('duplicated', async function() {

          // given
          const node = createElement('bpmn:Process', {
            flowElements: [
              createElement('bpmn:IntermediateCatchEvent', {
                eventDefinitions: [
                  createElement('bpmn:LinkEventDefinition', {
                    name: 'foo'
                  })
                ]
              }),
              createElement('bpmn:IntermediateCatchEvent', {
                eventDefinitions: [
                  createElement('bpmn:LinkEventDefinition', {
                    name: 'foo'
                  })
                ]
              })
            ]
          });

          const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-cloud/link-event');

          const reports = await getLintErrors(node, rule);

          // when
          reports.forEach(report => {
            const entryIds = getEntryIds(report);

            // then
            expect(entryIds).to.eql([ 'linkName' ]);

            expectErrorMessage(entryIds[ 0 ], 'Must be unique.', report);
          });
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


      it('should not return errors for category info', async function() {

        // given
        const linter = new Linter();

        const { root } = await createModdle(propertiesPanelInfoXML);

        const reports = await linter.lint(root);

        // when
        let element = root.rootElements[ 0 ].flowElements.find(({ id }) => id === 'Task_1');

        let errors = getErrors(reports, element);

        // then
        expect(errors).to.be.empty;
      });


      it('should not return errors for category warn', async function() {

        // given
        const linter = new Linter({
          plugins: [
            {
              config: {
                rules: {
                  'camunda-compat/secrets': 'warn'
                }
              }
            }
          ]
        });

        const { root } = await createModdle(propertiesPanelInfoXML);

        const reports = await linter.lint(root);

        // when
        let element = root.rootElements[ 0 ].flowElements.find(({ id }) => id === 'Task_1');

        let errors = getErrors(reports, element);

        // then
        expect(errors).to.be.empty;
      });

    });

  });


  describe('Camunda Platform (Camunda 7)', function() {

    describe('#getEntryId and #getErrorMessage', function() {

      it('History cleanup (no time to live)', async function() {

        // given
        const node = createElementCamundaPlatform('bpmn:Process', { isExecutable: true });

        const { default: rule } = await import('bpmnlint-plugin-camunda-compat/rules/camunda-platform/history-time-to-live');

        const report = await getLintError(node, rule, { platform: 'camunda-platform', version: '7.19' });

        // when
        const entryIds = getEntryIds(report);

        // then
        expect(entryIds).to.eql([ 'historyTimeToLive' ]);


        expectErrorMessage(entryIds[ 0 ], 'Time to live must be defined.', report);
      });

    });


    describe('#getErrors', function() {

      it('should return errors', async function() {

        // given
        const linter = new Linter();

        const { root } = await createModdleCamundaPlatform(propertiesPanelPlatformXML);

        const reports = await linter.lint(root);

        // when
        let element = root.rootElements[ 0 ];

        let errors = getErrors(reports, element);

        // then
        expect(errors).to.eql({
          historyTimeToLive: 'Time to live must be defined.'
        });
      });

    });

  });

});

function expectErrorMessage(id, expectedErrorMessage, report) {

  // when
  const errorMessage = getErrorMessage(id, report);

  // then
  expect(errorMessage).to.equal(expectedErrorMessage);
}

function expectNoErrorMessage(id, report) {
  expectErrorMessage(id, undefined, report);
}