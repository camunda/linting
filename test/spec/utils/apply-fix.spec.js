import { expect } from 'chai';

import sinon from 'sinon';

import { applyFix } from '../../../lib/utils/apply-fix';

describe('utils/apply-fix', function() {

  describe('#applyFix', function() {

    it('should rewrite the source of the targeted moddle element for a replace-source fix', function() {

      // given
      const element = { id: 'Task_1' };
      const moddleElement = { source: '=fromAi("toolCall.url", "fetch the url")' };
      const modeling = { updateModdleProperties: sinon.spy() };

      const report = {
        data: {
          fix: {
            apply: { type: 'replace-source', value: '=fromAi(toolCall.url, "fetch the url")' }
          }
        }
      };

      // when
      applyFix(report, element, modeling, moddleElement);

      // then
      expect(modeling.updateModdleProperties).to.have.been.calledOnceWith(
        element,
        moddleElement,
        { source: '=fromAi(toolCall.url, "fetch the url")' }
      );
    });


    it('should be a no-op when the report carries no fix', function() {

      // given
      const modeling = { updateModdleProperties: sinon.spy() };

      // when
      applyFix({ data: {} }, { id: 'Task_1' }, modeling, {});

      // then
      expect(modeling.updateModdleProperties).not.to.have.been.called;
    });


    it('should be a no-op for an unsupported apply type', function() {

      // given
      const modeling = { updateModdleProperties: sinon.spy() };

      const report = {
        data: { fix: { apply: { type: 'move-input' } } }
      };

      // when
      applyFix(report, { id: 'Task_1' }, modeling, {});

      // then
      expect(modeling.updateModdleProperties).not.to.have.been.called;
    });

  });

});
