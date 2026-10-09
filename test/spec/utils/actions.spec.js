import { expect } from 'chai';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

import { getAction } from '../../../lib/utils/actions';

import { createElement } from '../../helper';


describe('utils/actions', function() {

  describe('#getAction', function() {

    function createReport(type, node, property, requiredValue) {
      return {
        id: node.get('id'),
        message: 'foo',
        path: [ property ],
        data: {
          type,
          node,
          parentNode: null,
          property,
          requiredValue
        }
      };
    }


    it('should not get action (no data)', function() {

      // when
      const action = getAction({ id: 'Process_1', message: 'foo' });

      // then
      expect(action).to.be.null;
    });


    it('should not get action (unsupported error type)', function() {

      // given
      const report = createReport(ERROR_TYPES.PROPERTY_REQUIRED, createElement('bpmn:Process', { id: 'Process_1' }), 'isExecutable');

      // when
      const action = getAction(report);

      // then
      expect(action).to.be.null;
    });


    describe('property value required', function() {

      it('should get action (process executable)', function() {

        // given
        const report = createReport(ERROR_TYPES.PROPERTY_VALUE_REQUIRED, createElement('bpmn:Process', { id: 'Process_1' }), 'isExecutable', true);

        // when
        const action = getAction(report);

        // then
        expect(action.label).to.equal('Make executable');
      });


      it('should get action (wait for completion)', function() {

        // given
        const report = createReport(ERROR_TYPES.PROPERTY_VALUE_REQUIRED, createElement('bpmn:CompensateEventDefinition', { id: 'CompensateEventDefinition_1' }), 'waitForCompletion', true);

        // when
        const action = getAction(report);

        // then
        expect(action.label).to.equal('Set "Wait for completion"');
      });


      it('should not get action (unsupported property)', function() {

        // given
        const report = createReport(ERROR_TYPES.PROPERTY_VALUE_REQUIRED, createElement('bpmn:StartEvent', { id: 'StartEvent_1' }), 'isInterrupting', false);

        // when
        const action = getAction(report);

        // then
        expect(action).to.be.null;
      });

    });

  });

});
