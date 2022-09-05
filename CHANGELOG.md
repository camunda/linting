# Changelog

All notable changes to [@camunda/linting](https://github.com/camunda/linting) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.5.0-alpha.0

* `FEAT`: add bpmn-js plugin for canvas and properties panel errors ([#11](https://github.com/camunda/linting/pull/11))
* `FEAT`: add no-zeebe-properties rule ([#43](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/43))

## 0.4.1

* `DEPS`: broaden supported versions range of `bpmn-js-properties-panel`

## 0.4.0

* `FEAT`: add duplicate task headers rule ([#41](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/41))

## 0.3.5

* `FIX`: ignore null properties ([#39](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/39))

## 0.3.4

* `FIX`: make `bpmn-moddle` and `zeebe-bpmn-moddle` production dependencies ([#9](https://github.com/camunda/linting/pull/9))

## 0.3.3

* `FIX`: fix business rule task error message in properties panel ([#8](https://github.com/camunda/linting/pull/8))

## 0.3.2

* `FIX`: make `modeler-moddle` dependency ([e9d53714](https://github.com/camunda/linting/commit/e9d5371456cd2e783ae2c7c0c3ca0f4c5047db1a))

## 0.3.1

* `FIX`: include `properties-panel.js` in published package ([a532ba5b](https://github.com/camunda/linting/commit/a532ba5b7bf0b126477c218484e668c418875b4e))

## 0.3.0

* `FEAT`: add properties panel entry ID to reports ([#7](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/7))
* `FEAT`: add #getErrors function that creates properties panel errors from reports ([#7](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/7))
* `FEAT`: adjust connectors error message ([#6](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/6))

### BREAKING CHANGES

* #lint is not static anymore, Linter must be instantiated

## 0.2.0

* `FEAT`: add templates rule ([#31](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/31))

## 0.1.1

* `FIX`: lint subscription only if start event child of sub process ([#34](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/34))

## 0.1.0

* `FEAT`: initial release bundling [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat/) and Camunda specific functionality ([#1](https://github.com/camunda/linting/pull/1))
