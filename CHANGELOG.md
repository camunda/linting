# Changelog

All notable changes to [@camunda/linting](https://github.com/camunda/linting) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.10.0

* `FEAT`: add `executable-process` rule ([#56](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/56))
* `FEAT`: add `sequence-flow-condition` rule ([#58](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/58))
* `FEAT`: add Camunda Platform 8.2 config ([#59](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/59))
* `DEPS`: update `bpmnlint-plugin-camunda-compat` to v0.15.1
* `DEPS`: update `bpmnlint` to v8.1.1

## 0.9.1

* `FIX`: handle minor and patch versions when getting execution platform label ([#35](https://github.com/camunda/linting/pull/35))

## 0.9.0

* `FEAT`: add `feel` rule to validate feel expressions ([#51](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/51))
* `FEAT`: add `collapsed-subprocess` rule to disallow collapsed subprocess ([#52](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/52))
* `FEAT`: error message hints at allowed version ([#34](https://github.com/camunda/linting/pull/34))

## 0.8.0

* `FEAT`: show lint error and warning annotations ([#32](https://github.com/camunda/linting/pull/32))

## 0.7.2

* `CHORE`: rename label for Camunda 8.0 ([#28](https://github.com/camunda/linting/pull/28))

## 0.7.1

* `FIX`: use correct label for Camunda 8.1 ([#26](https://github.com/camunda/linting/issues/26))

## 0.7.0

* `FEAT`: support `bpmnlint` plugins ([#20](https://github.com/camunda/linting/pull/20))
* `FEAT`: add `timer` rule ([#45](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/45))
* `DEPS`: update production dependencies

## 0.6.1

* `FIX`: use setTimeout to work around properties panel focus issue ([#19](https://github.com/camunda/linting/pull/19))

## 0.6.0

* `FEAT`: add inclusive-gateway rule ([#44](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/44))

## 0.5.0

* `FIX`: do not show annotations on update if inactive ([#16](https://github.com/camunda/linting/pull/16))

## 0.5.0-alpha.3

* `CHORE`: highlight linting annotation on selected instead of hover ([f481cf22](https://github.com/camunda/linting/commit/f481cf22b9e5c7da3161ab70861b604dc7ec7f89))

## 0.5.0-alpha.2

* `FIX`: publish assets

## 0.5.0-alpha.1

* `FIX`: publish modeler.js

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
