import { inspect } from "util";
import { Parser, TypeStringGenerator } from "../dist/main.js";

const parser = new Parser();
const result = await parser.parse("./openapi/api.yaml");

console.log(inspect(result.operations, false, Infinity, true));

const generator = new TypeStringGenerator({
  namedSchemaPrefix: "schemas.",
});

for (const [url, { schema, name }] of result.schemas.entries()) {
  console.log({ url, name, type: generator.generate(schema, result.schemas) });
}
