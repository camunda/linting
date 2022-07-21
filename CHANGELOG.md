# Changelog

All notable changes to [@camunda/linting](https://github.com/camunda/linting) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

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
