import { expect } from 'chai';

import StaticResolver from 'bpmnlint/lib/resolver/static-resolver';

import { createModdle } from '../helper';

import { Linter } from '../..';

import simpleXML from './simple.bpmn';
import noExecutionPlatformXML from './no-execution-platform.bpmn';
import camundaCloud10XML from './camunda-cloud-1-0.bpmn';
import camundaCloud10ErrorsXML from './camunda-cloud-1-0-errors.bpmn';
import camundaCloud11XML from './camunda-cloud-1-1.bpmn';
import camundaCloud11ErrorsXML from './camunda-cloud-1-1-errors.bpmn';
import camundaCloud12XML from './camunda-cloud-1-2.bpmn';
import camundaCloud12ErrorsXML from './camunda-cloud-1-2-errors.bpmn';
import camundaCloud13XML from './camunda-cloud-1-3.bpmn';
import camundaCloud13ErrorsXML from './camunda-cloud-1-3-errors.bpmn';
import camundaCloud80XML from './camunda-cloud-8-0.bpmn';
import camundaCloud80ErrorsXML from './camunda-cloud-8-0-errors.bpmn';
import camundaCloud81XML from './camunda-cloud-8-1.bpmn';
import camundaCloud81ErrorsXML from './camunda-cloud-8-1-errors.bpmn';
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
        const { root } = await createModdle(camundaCloud10XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.0.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud10ErrorsXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud11XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud11ErrorsXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.2.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud12XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.2.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud12ErrorsXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 1.3.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud13XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 1.3.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud13ErrorsXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 8.0.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud80XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 8.0.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud80ErrorsXML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).not.to.be.empty;
      });


      it('should lint without errors (Camunda Cloud 8.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud81XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      it('should lint with errors (Camunda Cloud 8.1.0)', async function() {

        // given
        const { root } = await createModdle(camundaCloud81ErrorsXML);

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


  describe('plugins', function() {

    const FooPlugin = {
      config: {
        rules: {
          'foo/fake-join': 'error'
        }
      },
      resolver: new StaticResolver({
        'rule:bpmnlint-plugin-foo/fake-join': require('bpmnlint/rules/fake-join')
      })
    };

    const BarPlugin = {
      config: {
        extends: 'plugin:foo/recommended',
        rules: {
          'bar/single-blank-start-event': 'error'
        }
      },
      resolver: new StaticResolver({
        'config:bpmnlint-plugin-foo/recommended': {
          rules: {
            'foo/fake-join': 'error'
          }
        },
        'rule:bpmnlint-plugin-foo/fake-join': require('bpmnlint/rules/fake-join'),
        'rule:bpmnlint-plugin-bar/single-blank-start-event': require('bpmnlint/rules/single-blank-start-event')
      })
    };

    const BazPlugin = {
      config: {
        rules: {
          'foo/fake-join': 'off'
        }
      },
      resolver: new StaticResolver({})
    };


    it('should add rules (rules)', async function() {

      // given
      const linter = new Linter({
        plugins: [
          FooPlugin
        ]
      });

      const { root } = await createModdle(simpleXML);

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.have.length(2);

      expect(reports.find(({ message }) => message === 'Incoming flows do not join')).to.exist;
    });


    it('should add rules (extends)', async function() {

      // given
      const linter = new Linter({
        plugins: [
          BarPlugin
        ]
      });

      const { root } = await createModdle(simpleXML);

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.have.length(3);

      expect(reports.find(({ message }) => message === 'Incoming flows do not join')).to.exist;
      expect(reports.find(({ message }) => message === 'Process has multiple blank start events')).to.exist;
    });


    it('should disable rules', async function() {

      // given
      const linter = new Linter({
        plugins: [
          FooPlugin,
          BarPlugin,
          BazPlugin
        ]
      });

      const { root } = await createModdle(simpleXML);

      // when
      const reports = await linter.lint(root);

      // then
      expect(reports).to.have.length(2);

      expect(reports.find(({ message }) => message === 'Incoming flows do not join')).not.to.exist;
      expect(reports.find(({ message }) => message === 'Process has multiple blank start events')).to.exist;
    });

  });

});