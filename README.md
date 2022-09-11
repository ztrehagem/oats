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

## Usage

```ts
import { Parser, TypeStringGenerator } from "@ztrehagem/oats";

const parser = new Parser();
const { operations, schemas } = await parser.parse("./path/to/openapidoc.yaml");
```

examples:

- [`operations`](./example/out/parsedOperations.generated.js)
- [`schemas`](./example/out/parsedSchemas.generated.js)

```ts
const generator = new TypeStringGenerator();

for (const [url, { name, schema }] of schemas.entries()) {
  const schemaType = generator.generate(schema, { schemas });
}
```

code generation examples:

- [generated schema types](./example/out/schemas.generated.ts)
- [generated operation types](./example/out/operations.generated.ts)
- [script](./example/run.js)
