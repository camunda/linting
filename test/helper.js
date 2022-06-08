import BpmnModdle from 'bpmn-moddle';

import { isArray } from 'min-dash';

import modelerModdleSchema from 'modeler-moddle/resources/modeler.json';
import zeebeModdleSchema from 'zeebe-bpmn-moddle/resources/zeebe.json';

import { readFileSync } from 'fs';

export function readModdle(filePath) {
  const contents = readFileSync(filePath, 'utf8');

  return createModdle(contents);
}

export async function createModdle(xml) {
  const moddle = new BpmnModdle({
    modeler: modelerModdleSchema,
    zeebe: zeebeModdleSchema
  });

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

export function createElement(type, properties) {
  const moddle = new BpmnModdle({
    modeler: modelerModdleSchema,
    zeebe: zeebeModdleSchema
  });

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