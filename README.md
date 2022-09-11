# @ztrehagem/oats

[![](https://img.shields.io/npm/v/@ztrehagem/oats)](https://www.npmjs.com/package/@ztrehagem/oats)
[![](https://img.shields.io/npm/types/@ztrehagem/oats)]()
[![](https://img.shields.io/librariesio/release/npm/@ztrehagem/oats)]()
[![](https://img.shields.io/github/license/ztrehagem/oats)](./LICENSE)

Generate TypeScript code from OpenAPI documents.

## Installation

```
npm install @ztrehagem/oats
```

## Example

```js
import { Parser, TypeStringGenerator } from "@ztrehagem/oats";

const parser = new Parser();
const { operations, schemas } = await parser.parse("./path/to/openapidoc.yaml");

const generator = new TypeStringGenerator();

for (const [url, { name, schema }] of schemas.entries()) {
  const schemaType = generator.generate(schema, { schemas });
}

// ...
```

[Full script](./example/run.js)

code generation examples:

- [schema types](./example/out/schemas.generated.ts)
- [operation types](./example/out/operations.generated.ts)
