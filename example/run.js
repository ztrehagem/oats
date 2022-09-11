import * as fs from "fs/promises";
import { execSync } from "child_process";
import { pascalCase } from "pascal-case";
import { inspect } from "util";
import { Parser, TypeStringGenerator } from "../dist/main.js";

const parser = new Parser();
const { operations, schemas } = await parser.parse(
  "./example/openapi/api.yaml"
);

await fs.mkdir(new URL("out", import.meta.url), { recursive: true });

await fs.writeFile(
  "./example/out/parsedOperations.generated.js",
  "export default " + inspect(operations, false, Infinity, false)
);

await fs.writeFile(
  "./example/out/parsedSchemas.generated.js",
  "export default " +
    inspect(Object.fromEntries(schemas.entries()), false, Infinity, false)
);

await (async function generateSchemas() {
  const file = await fs.open("./example/out/schemas.generated.ts", "w");
  const st = file.createWriteStream();

  st.write("/* eslint-disable */\n");

  const gen = new TypeStringGenerator();

  for (const [, { name, schema }] of schemas.entries()) {
    const type = gen.generate(schema, { schemas });
    const typeName = pascalCase(name);
    st.write(`export type ${typeName} = ${type};\n`);
  }

  await file.close();
})();

await (async function generateOperations() {
  const file = await fs.open("./example/out/operations.generated.ts", "w");
  const st = file.createWriteStream();

  st.write("/* eslint-disable */\n");
  st.write('import * as schemas from "./schemas.generated.js";\n\n');

  const gen = new TypeStringGenerator({ namedSchemaPrefix: "schemas." });

  for (const op of operations) {
    const pathParametersType = op.parameters.path
      ? gen.generate(op.parameters.path, { schemas })
      : "void";

    const queryParamteresType = op.parameters.query
      ? gen.generate(op.parameters.query, { schemas })
      : "void";

    const requestTypesType =
      op.requestTypes
        .map(({ mediaType, schema }) => {
          const type = gen.generate(schema, { schemas });
          return `{ ${JSON.stringify(mediaType)}: ${type}; }`;
        })
        .join(" & ") || "void";

    const responseTypesType =
      op.responseTypes
        .map(({ status, schema }) => {
          const type = gen.generate(schema, { schemas });
          return `{ ${status}: ${type}; }`;
        })
        .join(" & ") || "void";

    st.write(`export namespace ${pascalCase(op.operationId)} {\n`);
    st.write(`  export const method = "${op.method}";\n`);
    st.write(`  export const path = "${op.path}";\n`);
    st.write(`  export type PathParameters = ${pathParametersType};\n`);
    st.write(`  export type QueryParameters = ${queryParamteresType};\n`);
    st.write(`  export type RequestTypes = ${requestTypesType}\n`);
    st.write(`  export type ResponseTypes = ${responseTypesType}\n`);
    st.write(`}\n\n`);
  }

  await file.close();
})();

execSync("prettier --write ./example/out/", { stdio: "inherit" });
