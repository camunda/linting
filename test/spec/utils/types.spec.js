import { expect } from 'chai';

import { getTypeString } from '../../../lib/utils/types';

import { createElement } from '../../helper';

describe('utils/types', function() {

  it('should get type (undefined task)', function() {

    // given
    const element = createElement('bpmn:Task');

    // when
    // then
    expect(getTypeString(element)).to.equal('Undefined Task');
  });


  it('should get type (service task)', function() {

    // given
    const element = createElement('bpmn:ServiceTask');

    // when
    // then
    expect(getTypeString(element)).to.equal('Service Task');
  });


  it('should get type (undefined intermediate catch event)', function() {

    // given
    const element = createElement('bpmn:IntermediateCatchEvent');

    // when
    // then
    expect(getTypeString(element)).to.equal('Undefined Intermediate Catch Event');
  });


  it('should get type (message intermediate catch event)', function() {

    // given
    const element = createElement('bpmn:IntermediateCatchEvent', {
      eventDefinitions: [
        createElement('bpmn:MessageEventDefinition')
      ]
    });

    // when
    // then
    expect(getTypeString(element)).to.equal('Message Intermediate Catch Event');
  });

});