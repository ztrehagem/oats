import { NamedSchema } from "./models/NamedSchema.js";
import { SchemaAst } from "./models/SchemaAst.js";

export type Options = {
  namedSchemaPrefix: string;
};

export class TypeStringGenerator {
  readonly #options: Options;

  constructor(options: Partial<Options> = {}) {
    this.#options = {
      namedSchemaPrefix: options.namedSchemaPrefix ?? "",
    };
  }

  generate(ast: SchemaAst, map: ReadonlyMap<string, NamedSchema>): string {
    if (ast.type === "ref") {
      const schema = map.get(ast.url);

      if (!schema) {
        return "unknown";
      }

      if (schema.name) {
        return `${this.#options.namedSchemaPrefix}${schema.name}`;
      }

      return this.generate(schema.schema, map);
    }

    if (ast.type === "atom") {
      return ast.name;
    }

    if (ast.type === "intersection") {
      return ast.children.map((s) => this.generate(s, map)).join(" & ");
    }

    if (ast.type === "union") {
      return ast.children.map((s) => this.generate(s, map)).join(" | ");
    }

    if (ast.type === "enum") {
      return ast.cases.join(" | ");
    }

    if (ast.type === "array") {
      return `Array<${this.generate(ast.child, map)}>`;
    }

    if (ast.type === "object") {
      const props = ast.properties.map((property) => {
        const name = JSON.stringify(property.name);
        const optional = property.required ? "" : "?";
        const type = this.generate(property.schema, map);
        return `${name}${optional}: ${type};`;
      });
      return `{ ${props.join(" ")} }`;
    }

    const _: never = ast;

    return "unknown";
  }
}
