import { Ast } from "./ast";

export type Options = {
  refNamePrefix?: string;
};

export const generate = (ast: Ast, options: Options = {}): string => {
  const { refNamePrefix = "" } = options;

  if (ast.type === "ref") {
    const name = ast.ref.split("/").pop()!;
    return `${refNamePrefix}${name}`;
  }

  if (ast.type === "atom") {
    return ast.name;
  }

  if (ast.type === "intersection") {
    return ast.children.map((child) => generate(child, options)).join(" & ");
  }

  if (ast.type === "union") {
    return ast.children.map((child) => generate(child, options)).join(" | ");
  }

  if (ast.type === "enum") {
    return ast.cases.join(" | ");
  }

  if (ast.type === "array") {
    return `Array<${generate(ast.child, options)}>`;
  }

  if (ast.type === "object") {
    const props = ast.properties.map((property) => {
      const name = JSON.stringify(property.name);
      const optional = property.required ? "" : "?";
      const type = generate(property.schema, options);
      return `${name}${optional}: ${type};`;
    });
    return `{ ${props.join(" ")} }`;
  }

  const _: never = ast;

  return "unknown";
};
