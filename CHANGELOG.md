# Changelog

All notable changes to [@camunda/linting](https://github.com/camunda/linting) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 3.29.0

* `FEAT`: support for task listeners ([#123](https://github.com/camunda/linting/pull/123))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.28.0`
* `DEPS`: update to `zeebe-bpmn-moddle@1.7.0`

## 3.28.0

* `FEAT`: add `zeebe-user-task` rule ([camunda/bpmnlint-plugin-camunda-compat#179](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/179))
* `FEAT`: add Camunda 8.7 and 7.23 configurations ([camunda/bpmnlint-plugin-camunda-compat#176](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/176))
* `FIX`: lint message end events for task definition ([camunda/bpmnlint-plugin-camunda-compat#180](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/180))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.27.0`

## 3.27.2

* `FIX`: report FEEL errors for processes ([camunda/bpmnlint-plugin-camunda-compat#175](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/175))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.26.1`

## 3.27.1

* `FIX`: correct false positive in `global` rule ([bpmn-io/bpmnlint#139](https://github.com/bpmn-io/bpmnlint/issues/139))
* `FIX`: correct false positive in `no-implicit-end` rule ([bpmn-io/bpmnlint#140](https://github.com/bpmn-io/bpmnlint/issues/140))
* `FIX`: correct `label-required` not triggering for boundary events ([bpmn-io/bpmnlint#141](https://github.com/bpmn-io/bpmnlint/issues/141))
* `DEPS`: update to `bpmnlint@10.3.1`

## 3.27.0

* `FEAT`: introduce `version-tag` rule ([camunda/bpmnlint-plugin-camunda-compat#174](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/174))
* `FIX`: do not double validate version tag field ([camunda/bpmnlint-plugin-camunda-compat#174](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/174))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.26.0`

## 3.26.1

* `FIX`: support zeebe:PriorityDefinition errors ([#116](https://github.com/camunda/linting/pull/116))

## 3.26.0

* `FEAT`: support zeebe:VersionTag and zeebe:versionTag errors ([#115](https://github.com/camunda/linting/pull/115))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.25.0`
* `DEPS`: update to `zeebe-bpmn-moddle@1.6.0`

## 3.25.0

* `FEAT`: validate `zeebe:priorityDefinition:priority` ([#113](https://github.com/camunda/linting/issues/113))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.24.0`

## 3.24.0

* `FEAT`: handle `no-binding-type` rule ([#112](https://github.com/camunda/linting/pull/112))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.23.0`

## 3.23.0

* `FEAT`: support execution listeners ([#111](https://github.com/camunda/linting/pull/111))
* `FIX`: improve `no-loop` performance ([bpmnlint-plugin-camunda-compat#165](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/165))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.22.0`
* `DEPS`: update to `zeebe-bpmn-moddle@1.4.0`

## 3.22.0

* `FEAT`: support joining inclusive gateway in Camunda 8.6 ([#109](https://github.com/camunda/linting/pull/109))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.21.0` ([#109](https://github.com/camunda/linting/pull/109))

## 3.21.1

* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.20.2` ([#108](https://github.com/camunda/linting/issues/108))

## 3.21.0

* `FEAT`: show supported Camunda version in properties panel ([#102](https://github.com/camunda/linting/issues/102))

## 3.20.0

* `FEAT`: enable `bpmnlint/no-bpmndi` by default ([#105](https://github.com/camunda/linting/pull/105))

## 3.19.0

* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.19.0`

## 3.18.1

* `FIX`: show error for process refs ([#104](https://github.com/camunda/linting/pull/104))

## 3.18.0

`FEAT`: handle `wait-for-completion` rule ([#103](https://github.com/camunda/linting/pull/103))
`DEPS`: update to `bpmnlint-plugin-camunda-compat@2.18.0`

## 3.17.0

`FEAT`: handle `no-zeebe-user-task` rule ([#101](https://github.com/camunda/linting/pull/101))
`FEAT`: handle missing form property for Zeebe User Task ([#101](https://github.com/camunda/linting/pull/101))
`DEPS`: update to `bpmnlint-plugin-camunda-compat@2.17.0`
`DEPS`: update to `bpmn-js-properties-panel@5.13.0`
`DEPS`: update to `camunda-bpmn-js-behaviors@1.3.0`
`DEPS`: update to `zeebe-bpmn-moddle@1.1.0`

## 3.16.0

* `FEAT`: make `history-time-to-live` an informative hint ([camunda/bpmnlint-plugin-camunda-compat#160](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/160))
* `FEAT`: report missing form definition as warning, not error ([camunda/bpmnlint-plugin-camunda-compat#154](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/154), [camunda/bpmnlint-plugin-camunda-compat#157](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/157))
* `FIX`: correct `escalation-reference` to allow start event without `escalationRef` ([camunda/bpmnlint-plugin-camunda-compat#158](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/158))
* `FIX`: report `secrets` as `warn`, not `error` ([camunda/bpmnlint-plugin-camunda-compat#157](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/157))
* `FIX`: expose main entry point
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.16.0`

## 3.15.0

* `DEPS`: update to `bpmnlint@10`

## 3.14.0

* `FEAT`: simplify FEEL error messages ([#97](https://github.com/camunda/linting/pull/97))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.15.0`

## 3.13.0

* `FEAT`: ensure user tasks have a `formDefinition` ([#150](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/151))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.14.0`

## 3.12.0

* `FEAT`: allow collapsed subprocess in 8.4
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.13.0`

## 3.11.0

* `FEAT`: allow `formKey` and `formId` starting with v8.3 when linting start event forms ([#149](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/149))
* `FIX`: differentiate between desktop and web modeler when linting user task forms ([#149](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/149))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.12.0`

## 3.10.0

* `FEAT`: add 8.4 and 7.21 config ([#143](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/143))
* `FEAT`: validate `formId` with Camunda 8.4 and newer ([#144](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/144))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.11.1`

## 3.9.0

* `FEAT`: rename `Camunda Platform` to `Camunda` ([#89](https://github.com/camunda/linting/pull/89))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.9.0`

## 3.8.1

* `FIX`: enable `signal-reference` rule for signal boundary events and signal intermediate catch events ([#138](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/138))

## 3.8.0

* `FEAT`: allow signal boundary, intermediate catch, and signal start events in sub-processes ([#86](https://github.com/camunda/linting/pull/86))
* `FEAT`: enable `secrets` rule for Camunda 8.3 ([#86](https://github.com/camunda/linting/pull/86))
* `FIX`: only display errors in properties panel ([#86](https://github.com/camunda/linting/pull/86))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.8.0`

## 3.7.2

* `FIX`: correctly parse Camunda 7 XML ([#85](https://github.com/camunda/linting/pull/85))

## 3.7.1

* `FIX`: adjust `no-loop` error message ([#84](https://github.com/camunda/linting/pull/84))
* `FIX`: disable `secrets` rule ([#84](https://github.com/camunda/linting/pull/84))
* `CHORE`: adjust `secrets` warning message ([#84](https://github.com/camunda/linting/pull/84))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.7.1`

## 3.7.0

* `FEAT`: add `no-loop` rule
* `FIX`: `link-event` rule only checks link events
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.7.0`

## 3.6.0

* `FEAT`: add `no-propagate-all-parent-variables` rule
* `FEAT`: add `link-event` rule
* `FEAT`: add `secrets` rule
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.6.3`

## 3.5.1

* `FIX`: always scroll to element ([#78](https://github.com/camunda/linting/pull/78))

## 3.5.0

* `FEAT`: add documentation url to rules ([#74](https://github.com/camunda/linting/pull/74))
* `FEAT`: integrate `start-form` rule ([#75](https://github.com/camunda/linting/pull/75))
* `FIX`: correct linter annotation size ([#77](https://github.com/camunda/linting/pull/77))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.4.0`

## 3.4.1

* `FIX`: display overlays correctly when parent sets box-sizing ([#76](https://github.com/camunda/linting/pull/76))

## 3.4.0

* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.3.0`

## 3.3.0

* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.2.0`

## 3.2.0

* `FEAT`: improve overlay styles ([#70](https://github.com/camunda/linting/pull/70))
* `FEAT`: always show overlays and scale ([#72](https://github.com/camunda/linting/pull/72))
* `FEAT`: add execution platform and version to each report ([#66](https://github.com/camunda/linting/pull/66))
* `FIX`: fix time cycle error message ([#66](https://github.com/camunda/linting/pull/66))
* `FIX`: make root element selectable (by selecting nothing) ([#66](https://github.com/camunda/linting/pull/66))
* `FIX`: make missing time to live error selectable in properties panel ([#66](https://github.com/camunda/linting/pull/66))
* `CHORE`: create resolver using bpmnlint's compile-config helper ([#67](https://github.com/camunda/linting/pull/67))
* `DEPS`: update to `bpmnlint@9.2.0`
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@2.1.0`

## 3.1.1

* `CHORE`: add LICENSE
* `DEPS`: support `bpmn-js-properties-panel@3`

## 3.1.0

* `CHORE`: persist all `entryIds` in the report ([#63](https://github.com/camunda/linting/pull/63))

## 3.0.0

* `FEAT`: rule errors are now reported as `rule-error` category instead of `error` ([#109](https://github.com/bpmn-io/bpmnlint/pull/109))
* `DEPS`: update to `bpmnlint@9.0.0`

## 2.2.0

* `FEAT`: add `rule` name to each report ([#61](https://github.com/camunda/linting/pull/61))

## 2.1.0

* `FEAT`: extend Camunda 7.19 rules to Camunda 7.20 ([#101](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/101))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@1.4.0`

## 2.0.0

* `FIX`: fix _Timer_ _Type_ not supported error message ([#58](https://github.com/camunda/linting/pull/58))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@1.3.2`
* `DEPS` update `bpmn-js-properties-panel` peer dependency to `>= 2.0.0`

### Breaking Changes

* support of legacy `timerEventDefinitionDurationValue` ID for Camunda 8 _Timer_ group _Value_ entry was removed; `timerEventDefinitionValue` ID is now used for all _Value_ entries ([#98](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/98))

## 1.3.0

* `FEAT`: allow time date for timer intermediate catch and boundary event in Camunda 8.3 ([#98](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/98))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@1.3.1`

## 1.2.1

* `FIX`: make `modeler-moddle` a production dependency

## 1.2.0

* `FEAT`: add `event-based-gateway-target` rule ([#96](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/96))
* `FEAT`: allow conditional flow only if source is inclusive or exclusive gateway ([#97](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/97))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@1.2.0`

## 1.1.0

* `FEAT`: support signal throw event in Camunda 8.3 ([#93](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/93))
* `FEAT`: add `signal-reference` rule ([#93](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/93))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@1.1.0`

## 1.0.0

* `FEAT`: adjust `element-type` configuration and add `no-signal-event-sub-process` rule to allow signal start events in Camunda 8.2 ([#88](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/88))
* `FIX`: adjust `error-reference` rule to disallow error references without error code ([#89](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/89))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@1.0.0`

## 0.17.0

* `FEAT`: require history time to live in Camunda 7.19 ([#83](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/83))
* `FEAT`: add `task-schedule` and `no-task-schedule` rules ([#86](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/86))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@0.24.0`

## 0.16.0

* `FEAT`: allow error catch event without error code in Camunda 8.2 ([#44](https://github.com/camunda/linting/pull/44))

## 0.15.1

* `FIX`: display error message for disallowed FEEL error code

## 0.15.0

* `FEAT`: skip non-executable process ([#80](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/80))

## 0.14.0

* `FEAT`: adjust error code and escalation error messages
* `FEAT`: handle candidate users error
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@0.20.0`

## 0.13.0

* `FEAT`: support `Error#errorCode` as FEEL expression ([bpmnlint-plugin-camunda-compat#69](https://github.com/camunda/bpmnlint-plugin-camunda-compat/issues/69))
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@0.18.0`

## 0.12.0

* `FEAT`: support FEEL expression in Script Task ([#38](https://github.com/camunda/linting/issues/38))
* `DEPS`: update to `zeebe-bpmn-moddle@0.17.0`
* `DEPS`: update to `bpmnlint-plugin-camunda-compat@0.17.0`

## 0.11.0

* `FEAT`: add link events to `element-type` rule ([#63](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/63))
* `DEPS`: update `bpmnlint-plugin-camunda-compat` to v0.16.0

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
propertiesPanel.showEntry
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

### Breaking Changes

* #lint is not static anymore, Linter must be instantiated

## 0.2.0

* `FEAT`: add templates rule ([#31](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/31))

## 0.1.1

* `FIX`: lint subscription only if start event child of sub process ([#34](https://github.com/camunda/bpmnlint-plugin-camunda-compat/pull/34))

## 0.1.0

* `FEAT`: initial release bundling [bpmnlint](https://github.com/bpmn-io/bpmnlint) and [bpmnlint-plugin-camunda-compat](https://github.com/camunda/bpmnlint-plugin-camunda-compat/) and Camunda specific functionality ([#1](https://github.com/camunda/linting/pull/1))
