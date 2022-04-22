import { OpenAPIV3_1 as oa } from "openapi-types";
import { Ast } from "../schema/ast";

export const parse = (
  schema: oa.SchemaObject | oa.ReferenceObject | null | undefined
): Ast => {
  if (!schema) {
    return { type: "atom", name: "void" };
  }

  if ("$ref" in schema) {
    return {
      type: "ref",
      ref: schema.$ref,
    };
  }

  if (schema.allOf) {
    return {
      type: "intersection",
      children: schema.allOf.map((child) => parse(child)),
    };
  }

  if (schema.oneOf) {
    return {
      type: "union",
      children: schema.oneOf.map((child) => parse(child)),
    };
  }

  if (schema.anyOf) {
    return {
      type: "union",
      children: schema.anyOf.map((child) => parse(child)),
    };
  }

  if (Array.isArray(schema.type)) {
    return {
      type: "union",
      children: schema.type.map((type) =>
        parse({ ...schema, type } as oa.SchemaObject)
      ),
    };
  }

  if (schema.type === "null") {
    return { type: "atom", name: "null" };
  }

  if (schema.type === "boolean") {
    return { type: "atom", name: "boolean" };
  }

  if (schema.type === "integer" || schema.type === "number") {
    if (schema.enum) {
      return {
        type: "enum",
        cases: schema.enum.map((aCase) => String(Number(aCase))),
      };
    } else {
      return { type: "atom", name: "number" };
    }
  }

  if (schema.type === "string") {
    if (schema.enum) {
      return {
        type: "enum",
        cases: schema.enum.map((aCase) => JSON.stringify(String(aCase))),
      };
    } else {
      return { type: "atom", name: "string" };
    }
  }

  if (schema.type === "array") {
    if (schema.items) {
      return { type: "array", child: parse(schema.items) };
    } else {
      return { type: "array", child: { type: "atom", name: "unknown" } };
    }
  }

  if (schema.type === "object") {
    if (schema.properties) {
      return {
        type: "object",
        properties: Object.entries(schema.properties).map(
          ([name, childSchema]) => ({
            name,
            schema: parse(childSchema),
            required: schema.required?.includes(name) ?? false,
          })
        ),
      };
    } else {
      return { type: "atom", name: "object" };
    }
  }

  return { type: "atom", name: "unknown" };
};
