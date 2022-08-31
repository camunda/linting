import { expect } from 'chai';

import { readModdle } from '../helper';

import { Linter } from '../..';

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
      const { root } = await readModdle('test/spec/no-execution-platform.bpmn');

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.be.empty;
    });


    describe('camunda-cloud', function() {

      it('should lint without errors (Camunda Cloud 1.0.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-0-valid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.0.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-0-invalid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.1.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-1-valid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.1.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-1-invalid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.2.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-2-valid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.2.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-2-invalid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.3.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-3-valid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.3.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-1-3-invalid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 8.0.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-8-0-valid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 8.0.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-8-0-invalid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 8.1.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-8-1-valid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 8.1.0)', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-cloud-8-1-invalid.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });

    });


    describe('camunda-platform', function() {

      it('should not lint Camunda Platform 7.17', async function() {

        // given
        const { root } = await readModdle('test/spec/camunda-platform-7-17.bpmn');

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });

    });

  });

});