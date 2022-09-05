import { expect } from 'chai';

import { createModdle } from '../helper';

import { Linter } from '../..';

import noExecutionPlatformXML from './no-execution-platform.bpmn';
import camundaCloud10ValidXML from './camunda-cloud-1-0-valid.bpmn';
import camundaCloud10InvalidXML from './camunda-cloud-1-0-invalid.bpmn';
import camundaCloud11ValidXML from './camunda-cloud-1-1-valid.bpmn';
import camundaCloud11InvalidXML from './camunda-cloud-1-1-invalid.bpmn';
import camundaCloud12ValidXML from './camunda-cloud-1-2-valid.bpmn';
import camundaCloud12InvalidXML from './camunda-cloud-1-2-invalid.bpmn';
import camundaCloud13ValidXML from './camunda-cloud-1-3-valid.bpmn';
import camundaCloud13InvalidXML from './camunda-cloud-1-3-invalid.bpmn';
import camundaCloud80ValidXML from './camunda-cloud-8-0-valid.bpmn';
import camundaCloud80InvalidXML from './camunda-cloud-8-0-invalid.bpmn';
import camundaCloud81ValidXML from './camunda-cloud-8-1-valid.bpmn';
import camundaCloud81InvalidXML from './camunda-cloud-8-1-invalid.bpmn';
import camundaPlatform717XML from './camunda-platform-7-17.bpmn';

describe('Linter', function() {

  describe('configuration', function() {

    it('should configure for desktop modeler by default', function() {

      // when
      const linter = new Linter();

      // then
      expect(linter._modeler).to.equal('desktop');
    });


    it('should configure for web modeler', function() {

      // when
      const linter = new Linter({ modeler: 'web' });

      // then
      expect(linter._modeler).to.equal('web');
    });

  });


  describe('#lint', function() {

    let linter;

    beforeEach(function() {
      linter = new Linter();
    });


    it('should not lint (no execution platform)', async function() {

      // given
      const { root } = await createModdle(noExecutionPlatformXML);

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });


    describe('camunda-cloud', function() {

      it('should lint without errors (Camunda Cloud 1.0.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud10ValidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.0.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud10InvalidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud11ValidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud11InvalidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.2.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud12ValidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.2.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud12InvalidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.3.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud13ValidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.3.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud13InvalidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 8.0.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud80ValidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 8.0.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud80InvalidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 8.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud81ValidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 8.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud81InvalidXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });

    });


    describe('camunda-platform', function() {

      it('should not lint Camunda Platform 7.17', async function() {

        // given
        const { root } = await createModdle(camundaPlatform717XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });

    });

  });

});