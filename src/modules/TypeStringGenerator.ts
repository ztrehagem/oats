import { NamedSchema } from "../models/NamedSchema.js";
import { SchemaAst } from "../models/SchemaAst.js";

export interface TypeStringGeneratorOptions {
  namedSchemaPrefix: string;
}

export interface GenerateOptions {
  schemas?: ReadonlyMap<string, NamedSchema>;
}

export class TypeStringGenerator {
  readonly #options: TypeStringGeneratorOptions;

  constructor(options: Partial<TypeStringGeneratorOptions> = {}) {
    this.#options = {
      namedSchemaPrefix: options.namedSchemaPrefix ?? "",
    };
  }

  generate(ast: SchemaAst, options: GenerateOptions): string {
    if (ast.type === "ref") {
      const schema = options.schemas?.get(ast.url);

      if (!schema) {
        return "unknown";
      }

      if (schema.name) {
        return `${this.#options.namedSchemaPrefix}${schema.name}`;
      }

      return this.generate(schema.schema, options);
    }

    if (ast.type === "atom") {
      return ast.name;
    }

    if (ast.type === "intersection") {
      return ast.children.map((s) => this.generate(s, options)).join(" & ");
    }

    if (ast.type === "union") {
      return ast.children.map((s) => this.generate(s, options)).join(" | ");
    }

    if (ast.type === "enum") {
      return ast.cases.join(" | ");
    }

    if (ast.type === "array") {
      return `Array<${this.generate(ast.child, options)}>`;
    }

    if (ast.type === "object") {
      const props = ast.properties.map((property) => {
        const name = JSON.stringify(property.name);
        const optional = property.required ? "" : "?";
        const type = this.generate(property.schema, options);
        return `${name}${optional}: ${type};`;
      });
      return `{ ${props.join(" ")} }`;
    }

    const _: never = ast;

    return "unknown";
  }
}
