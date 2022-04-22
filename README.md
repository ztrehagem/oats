# @ztrehagem/oats

Tools for generating TypeScript code from your OpenAPI documents.

## Installation

```
npm install @ztrehagem/oats
```

## Examples

### Schema Object to TypeScript

```ts
import { parseSchemaObjectOAS3_1, generateSchemaType } from "@ztrehagem/oats";

const schemaObject = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    age: {
      type: "number",
    },
  },
  required: ["name"],
};

const ast = parseSchemaObjectOAS3_1(schemaObject);
const typeString = generateSchemaType(ast);
//=> '{ "name": string; "age"?: number; }'
```

### Parsing OpenAPI Document

```ts
import yaml from "js-yaml";
import { DocumentParserOAS3_1 } from "@ztrehagem/oats";

const doc = yaml.load(yamlString);

const parsed = new DocumentParserOAS3_1(doc).parse();
```
