import elementTemplates from './linting-element-templates.json';

import agenticAdHocToolsSchemaTemplate from './linting-agentic-adhoctoolsschema-template.json';
import agenticAiAgentTemplate from './linting-agentic-aiagent-template.json';
import agenticAiAgentJobWorkerTemplate from './linting-agentic-aiagent-jobworker-template.json';
import awsBedrockTemplate from './linting-aws-bedrock-template.json';
import httpJsonTemplate from './linting-http-json-template.json';

export default [
  ...elementTemplates,
  agenticAdHocToolsSchemaTemplate,
  agenticAiAgentTemplate,
  agenticAiAgentJobWorkerTemplate,
  awsBedrockTemplate,
  httpJsonTemplate
];
