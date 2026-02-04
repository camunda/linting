import { BpmnModdle } from 'bpmn-moddle';

import { isArray } from 'min-dash';

import camundaModdleSchema from 'camunda-bpmn-moddle/resources/camunda.json';
import modelerModdleSchema from 'modeler-moddle/resources/modeler.json';
import zeebeModdleSchema from 'zeebe-bpmn-moddle/resources/zeebe.json';

export async function createModdle(xml, executionPlatform = 'camunda-cloud') {
  const moddle = createBpmnModdle(executionPlatform);

  let root, warnings;

  try {
    ({
      rootElement: root,
      warnings = []
    } = await moddle.fromXML(xml, 'bpmn:Definitions', { lax: true }));
  } catch (err) {
    console.log(err);
  }

  return {
    root,
    moddle,
    context: {
      warnings
    },
    warnings
  };
}

export function createModdleCamundaCloud(xml) {
  return createModdle(xml, 'camunda-cloud');
}

export function createModdleCamundaPlatform(xml) {
  return createModdle(xml, 'camunda-platform');
}

export function createElement(type, properties, executionPlatform = 'camunda-cloud') {
  const moddle = createBpmnModdle(executionPlatform);

  const moddleElement = moddle.create(type, properties);

  const isReference = (propertyName, moddleElement) => {
    const { $descriptor } = moddleElement;

    const { propertiesByName } = $descriptor;

    const property = propertiesByName[ propertyName ];

    return property.isReference;
  };

  const setParent = (property) => {
    if (property.$type) {
      const childModdleElement = property;

      childModdleElement.$parent = moddleElement;
    }
  };

  if (properties) {
    Object.entries(properties).forEach(([ propertyName, property ]) => {
      if (isReference(propertyName, moddleElement)) {
        return;
      }

      setParent(property);

      if (isArray(property)) {
        property.forEach(setParent);
      }
    });
  }

  return moddleElement;
}

export function createElementCamundaCloud(type, properties) {
  return createElement(type, properties, 'camunda-cloud');
}

export function createElementCamundaPlatform(type, properties) {
  return createElement(type, properties, 'camunda-platform');
}

function createBpmnModdle(executionPlatform) {
  const moddleSchema = (executionPlatform === 'camunda-cloud') ?
    { zeebe: zeebeModdleSchema }
    : { camunda: camundaModdleSchema };

  return new BpmnModdle({
    modeler: modelerModdleSchema,
    ...moddleSchema
  });
}