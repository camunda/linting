import { expect } from 'chai';

import {
  applyFix,
  canApplyFix,
  getFixLabel,
  hasFix
} from '../../../lib/utils/apply-fix';

import { ERROR_TYPES } from 'bpmnlint-plugin-camunda-compat/rules/utils/error-types';

function moddle(props) {
  return {
    ...props,
    get(name) {
      return this[ name ];
    }
  };
}

// zeebe:Input -> zeebe:IoMapping -> bpmn:ExtensionElements -> task business object
function createElement(source) {
  const input = moddle({ source });
  const ioMapping = moddle({ inputParameters: [ input ] });
  const extensionElements = moddle({ values: [ ioMapping ] });
  const businessObject = moddle({ id: 'Task_1', extensionElements });

  return { element: { id: 'Task_1', businessObject }, input };
}

const CASING_PATH = [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ];

function casingReport(overrides = {}) {
  return {
    data: {
      type: ERROR_TYPES.AGENT_FEEL_FUNCTION_NAME_INVALID,
      fix: {
        apply: { type: 'replace-source', value: '=fromAi(toolCall.url, "fetch the url")' },
        confidence: 'safe'
      }
    },
    path: CASING_PATH,
    ...overrides
  };
}

describe('utils/apply-fix', function() {

  describe('#applyFix', function() {

    it('should return a command list that rewrites the targeted moddle element for a replace-source fix', function() {

      // given
      const { element, input } = createElement('=fromai(toolCall.url, "fetch the url")');

      // when
      const commands = applyFix({ report: casingReport(), element });

      // then
      expect(commands).to.eql([
        {
          cmd: 'element.updateModdleProperties',
          context: {
            element,
            moddleElement: input,
            properties: { source: '=fromAi(toolCall.url, "fetch the url")' }
          }
        }
      ]);
    });


    it('should return [] when the report carries no fix', function() {

      // given
      const { element } = createElement('=fromai(toolCall.url, "fetch the url")');

      // when
      const commands = applyFix({ report: { data: {} }, element });

      // then
      expect(commands).to.eql([]);
    });


    it('should return [] for an unsupported apply type', function() {

      // given
      const { element } = createElement('=fromai(toolCall.url, "fetch the url")');
      const report = { data: { fix: { apply: { type: 'move-input' }, confidence: 'safe' } }, path: CASING_PATH };

      // when
      const commands = applyFix({ report, element });

      // then
      expect(commands).to.eql([]);
    });


    it('should return [] when the path does not resolve to a moddle element', function() {

      // given
      const { element } = createElement('=fromai(toolCall.url, "fetch the url")');
      const report = casingReport({ path: [ 'extensionElements', 'values', 5, 'inputParameters', 0, 'source' ] });

      // when
      const commands = applyFix({ report, element });

      // then
      expect(commands).to.eql([]);
    });

  });


  describe('#hasFix', function() {

    it('should be true for a safe fix', function() {
      expect(hasFix(casingReport())).to.be.true;
    });


    it('should be false without a fix', function() {
      expect(hasFix({ data: {} })).to.be.false;
    });


    it('should be false for a non-safe confidence', function() {
      expect(hasFix(casingReport({ data: { fix: { apply: { type: 'replace-source', value: '=x' }, confidence: 'needs-review' } } }))).to.be.false;
    });

  });


  describe('#getFixLabel', function() {

    it('should label the casing fix', function() {
      expect(getFixLabel(casingReport())).to.eql('Fix');
    });


    it('should label an output-key casing fix', function() {
      expect(getFixLabel({
        data: { type: ERROR_TYPES.AGENT_TOOL_OUTPUT_KEY_CASING_INVALID }
      })).to.eql('Fix');
    });


    it('should fall back to a generic label', function() {
      expect(getFixLabel({ data: { type: 'something.else' } })).to.eql('Fix');
    });


    it('should label a whole-call correction as Autofill', function() {
      expect(getFixLabel({
        data: { fix: { kind: 'autofill' } }
      })).to.eql('Autofill');
    });

  });


  describe('#canApplyFix', function() {

    it('should be true when a fix resolves to a command', function() {
      const { element } = createElement('=fromai(toolCall.url, "fetch the url")');

      expect(canApplyFix(casingReport(), element)).to.be.true;
    });


    it('should be false when the fix does not resolve', function() {
      const { element } = createElement('=fromai(toolCall.url, "fetch the url")');

      expect(canApplyFix({ data: {} }, element)).to.be.false;
    });

  });

});
