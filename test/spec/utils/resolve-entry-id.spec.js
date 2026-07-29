import { getErrors } from '../../../lib/utils/properties-panel';

import { expect } from 'chai';

/**
 * Focused coverage for the render-time entry resolver (camunda/linting#164):
 * a `resolveEntryId(element, path)` provided by the properties panel takes
 * precedence over the statically derived ids, so template-bound fields resolve
 * to their rendered entry — and we still fall back when it defers.
 */
describe('utils/properties-panel - resolveEntryId adapter', function() {

  const path = [ 'extensionElements', 'values', 0, 'inputParameters', 0, 'source' ];

  function createElement(id) {
    const businessObject = {
      $type: 'bpmn:ServiceTask',
      get(key) {
        return key === 'id' ? id : undefined;
      }
    };

    return { businessObject };
  }

  function createReport(id) {
    return {
      id,
      category: 'error',
      message: 'Must be a valid FEEL expression.',
      path,

      // statically derived id, as baked by the headless Linter
      propertiesPanel: {
        entryIds: [ `${ id }-input-0-source` ]
      }
    };
  }


  it('should resolve entry id via panel (overriding static id)', function() {

    // given
    const element = createElement('Task_1');
    const report = createReport('Task_1');

    const resolveEntryId = (el, p) => {
      expect(el).to.equal(element);
      expect(p).to.equal(path);

      return 'custom-entry-my.template-1';
    };

    // when
    const errors = getErrors([ report ], element, resolveEntryId);

    // then
    expect(errors).to.have.property('custom-entry-my.template-1');
    expect(errors).not.to.have.property('Task_1-input-0-source');
  });


  it('should fall back to static id when panel defers (null)', function() {

    // given
    const element = createElement('Task_1');
    const report = createReport('Task_1');

    const resolveEntryId = () => null;

    // when
    const errors = getErrors([ report ], element, resolveEntryId);

    // then
    expect(errors).to.have.property('Task_1-input-0-source');
  });


  it('should use static id when no resolver is provided', function() {

    // given
    const element = createElement('Task_1');
    const report = createReport('Task_1');

    // when
    const errors = getErrors([ report ], element);

    // then
    expect(errors).to.have.property('Task_1-input-0-source');
  });


  describe('multi-field findings (report.paths)', function() {

    const paths = [
      [ 'extensionElements', 'values', 0, 'values', 0, 'key' ],
      [ 'extensionElements', 'values', 0, 'values', 1, 'key' ]
    ];

    // a duplicate-key finding: several offending leaf locations, one entry each
    function createMultiFieldReport(id) {
      return {
        id,
        category: 'error',
        message: 'Duplicate key.',
        path: null,
        paths,

        // statically derived fan-out, as baked by the headless Linter
        propertiesPanel: {
          entryIds: [ `${ id }-header-0-key`, `${ id }-header-1-key` ]
        }
      };
    }

    it('should resolve each leaf path via panel', function() {

      // given
      const element = createElement('Task_1');
      const report = createMultiFieldReport('Task_1');

      const seen = [];

      const resolveEntryId = (el, path) => {
        seen.push(path);

        // map each leaf location to its (hypothetical) template field
        return `custom-entry-my.template-${ path[ path.length - 2 ] }`;
      };

      // when
      const errors = getErrors([ report ], element, resolveEntryId);

      // then
      expect(seen).to.eql(paths);
      expect(errors).to.have.property('custom-entry-my.template-0');
      expect(errors).to.have.property('custom-entry-my.template-1');
      expect(errors).not.to.have.property('Task_1-header-0-key');
    });


    it('should fall back to static ids when any leaf path defers', function() {

      // given
      const element = createElement('Task_1');
      const report = createMultiFieldReport('Task_1');

      // resolves the first location, defers on the second -> all-or-nothing
      const resolveEntryId = (el, path) => {
        return path[ path.length - 2 ] === 0 ? 'custom-entry-my.template-0' : null;
      };

      // when
      const errors = getErrors([ report ], element, resolveEntryId);

      // then
      expect(errors).to.have.property('Task_1-header-0-key');
      expect(errors).to.have.property('Task_1-header-1-key');
      expect(errors).not.to.have.property('custom-entry-my.template-0');
    });


    it('should map a single report.path as one leaf location', function() {

      // given
      const element = createElement('Task_1');
      const report = createReport('Task_1');

      const seen = [];

      const resolveEntryId = (el, path) => {
        seen.push(path);

        return 'custom-entry-my.template-1';
      };

      // when
      const errors = getErrors([ report ], element, resolveEntryId);

      // then
      expect(seen).to.have.length(1);
      expect(errors).to.have.property('custom-entry-my.template-1');
    });

  });

});
