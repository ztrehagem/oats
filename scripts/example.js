import { inspect } from "util";
import { parse, TypeStringGenerator } from "../dist/main.js";

const result = await parse("./openapi/api.yaml");

console.log(inspect(result.operations, false, Infinity, true));

const generator = new TypeStringGenerator({
  namedSchemaPrefix: "schemas.",
});

for (const [url, { schema, name }] of result.schemas.entries()) {
  console.log({ url, name, type: generator.generate(schema, result.schemas) });
}
