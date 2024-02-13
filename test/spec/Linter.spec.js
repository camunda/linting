import sinon from 'sinon';

import StaticResolver from 'bpmnlint/lib/resolver/static-resolver';

import {
  createModdle,
  createModdleCamundaPlatform
} from '../helper';

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
import camundaCloud82XML from './camunda-cloud-8-2.bpmn';
import camundaCloud82ErrorsXML from './camunda-cloud-8-2-errors.bpmn';
import camundaPlatform717XML from './camunda-platform-7-17.bpmn';
import camundaPlatform719XML from './camunda-platform-7-19.bpmn';
import camundaPlatform719ErrorsXML from './camunda-platform-7-19-errors.bpmn';
import camundaPlatform720XML from './camunda-platform-7-20.bpmn';
import camundaPlatform720ErrorsXML from './camunda-platform-7-20-errors.bpmn';

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


    it('should add modeler configuration to rule configurations', async function() {

      // given
      const spy = sinon.spy(() => {
        return {
          check: () => {}
        };
      });

      const linter = new Linter({
        modeler: 'web',
        plugins: [
          {
            resolver: new StaticResolver({
              'rule:bpmnlint-plugin-camunda-compat/element-type': spy
            })
          }
        ]
      });

      const { root } = await createModdle(simpleXML);

      // when
      await linter.lint(root);

      // then
      expect(spy).to.have.been.calledWithMatch({
        modeler: 'web',
        version: '8.0'
      });
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


    it('should add name of rule to each report', async function() {

      // given
      const { root } = await createModdle(camundaCloud10ErrorsXML);

      // when
      const reports = await linter.lint(root);

      // then
      reports.forEach(report => {
        expect(report.rule).to.exist;
      });
    });


    it('should add documentation URL to each report', async function() {

      // given
      const { root } = await createModdle(camundaCloud10ErrorsXML);

      // when
      const reports = await linter.lint(root);

      // then
      reports.forEach(report => {
        expect(report.documentation.url).to.exist;
      });
    });


    it('should not break on rule error', async function() {

      // given
      const FooPlugin = {
        config: {
          rules: {
            'foo/rule-error': 'error'
          }
        },
        resolver: new StaticResolver({
          'rule:bpmnlint-plugin-foo/rule-error': () => {
            return {
              check() {
                throw new Error('Rule error');
              }
            };
          }
        })
      };

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

      expect(reports.find(({ category, message }) => {
        return category === 'rule-error' && message === 'Rule error';
      })).to.exist;
    });


    describe('camunda-cloud', function() {

      beforeEach(function() {
        linter = new Linter({ type: 'cloud' });
      });

      const versions = [
        [ '1.0', camundaCloud10XML, camundaCloud10ErrorsXML ],
        [ '1.1', camundaCloud11XML, camundaCloud11ErrorsXML ],
        [ '1.2', camundaCloud12XML, camundaCloud12ErrorsXML ],
        [ '1.3', camundaCloud13XML, camundaCloud13ErrorsXML ],
        [ '8.0', camundaCloud80XML, camundaCloud80ErrorsXML ],
        [ '8.1', camundaCloud81XML, camundaCloud81ErrorsXML ],
        [ '8.2', camundaCloud82XML, camundaCloud82ErrorsXML ]
      ];

      versions.forEach(function([ version, xml, errorsXML ]) {

        describe(`Camunda Cloud ${ version }`, function() {

          describe('from moddle', function() {

            it('should not have errors', async function() {

              // given
              const { root } = await createModdle(xml);

              // when
              const reports = await linter.lint(root);

              // then
              expect(reports).to.be.empty;
            });


            it('should have errors', async function() {

              // given
              const { root } = await createModdle(errorsXML);

              // when
              const reports = await linter.lint(root);

              // then
              expect(reports).not.to.be.empty;
            });

          });


          describe('from XML', function() {

            it('should not have errors', async function() {

              // when
              const reports = await linter.lint(xml);

              // then
              expect(reports).to.be.empty;
            });


            it('should have errors', async function() {

              // when
              const reports = await linter.lint(errorsXML);

              // then
              expect(reports).not.to.be.empty;
            });

          });

        });

      });

    });


    describe('camunda-platform', function() {

      beforeEach(function() {
        linter = new Linter({ type: 'platform' });
      });

      const versions = [
        [ '7.19', camundaPlatform719XML, camundaPlatform719ErrorsXML ],
        [ '7.20', camundaPlatform720XML, camundaPlatform720ErrorsXML ]
      ];

      it('should not lint Camunda Platform 7.17', async function() {

        // given
        const { root } = await createModdleCamundaPlatform(camundaPlatform717XML);

        // when
        const reports = await linter.lint(root);

        // then
        expect(reports).to.be.empty;
      });


      versions.forEach(function([ version, xml, errorsXML ]) {

        describe(`Camunda ${ version }`, function() {

          describe('from moddle', function() {

            it('should not have errors', async function() {

              // given
              const { root } = await createModdleCamundaPlatform(xml);

              // when
              const reports = await linter.lint(root);

              // then
              expect(reports).to.be.empty;
            });


            it('should not have errors', async function() {

              // given
              const { root } = await createModdleCamundaPlatform(errorsXML);

              // when
              const reports = await linter.lint(root);

              // then
              expect(reports).to.be.empty;
            });

          });


          describe('from xml', function() {

            it('should not have errors', async function() {

              // when
              const reports = await linter.lint(xml);

              // then
              expect(reports).to.be.empty;
            });


            it('should not have errors', async function() {

              // when
              const reports = await linter.lint(errorsXML);

              // then
              expect(reports).to.be.empty;
            });

          });

        });

      });

    });

  });


  describe('plugins', function() {

    const FooPlugin = {
      config: {
        rules: {
          'foo/superfluous-gateway': 'error'
        }
      },
      resolver: new StaticResolver({
        'rule:bpmnlint-plugin-foo/superfluous-gateway': require('bpmnlint/rules/superfluous-gateway')
      })
    };

    const BarPlugin = {
      config: {
        extends: 'plugin:foo/recommended',
        rules: {
          'bar/no-implicit-end': 'error'
        }
      },
      resolver: new StaticResolver({
        'config:bpmnlint-plugin-foo/recommended': {
          rules: {
            'foo/superfluous-gateway': 'error'
          }
        },
        'rule:bpmnlint-plugin-foo/superfluous-gateway': require('bpmnlint/rules/superfluous-gateway'),
        'rule:bpmnlint-plugin-bar/no-implicit-end': require('bpmnlint/rules/no-implicit-end')
      })
    };

    const BazPlugin = {
      config: {
        rules: {
          'foo/superfluous-gateway': 'off'
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

      expect(reports.find(({ message }) => message === 'Gateway is superfluous. It only has one source and target.')).to.exist;
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

      expect(reports.find(({ message }) => message === 'Gateway is superfluous. It only has one source and target.')).to.exist;
      expect(reports.find(({ message }) => message === 'Element is an implicit end')).to.exist;
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

      expect(reports.find(({ message }) => message === 'Gateway is superfluous. It only has one source and target.')).not.to.exist;
      expect(reports.find(({ message }) => message === 'Element is an implicit end')).to.exist;
    });

  });

});