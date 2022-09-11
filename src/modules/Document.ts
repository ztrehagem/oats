import { OpenAPIV3_1 as oa } from "openapi-types";
import { SchemaAst, TObject, TObjectProperty } from "../models/SchemaAst.js";
import { Operation, RequestType, ResponseType } from "../models/Operation.js";
import { httpMethods } from "../models/HttpMethod.js";
import { ParseContext } from "../models/ParseContext.js";

export interface DocumentOptions {
  url: URL;
  obj: oa.Document;
}

export class Document {
  readonly #url: URL;
  readonly #obj: oa.Document;

  constructor(options: DocumentOptions) {
    this.#url = options.url;
    this.#obj = options.obj;
  }

  query<T>(pathString: string): T {
    const keys = pathString.split("/").filter((key) => key.length > 0);

    let target: unknown = this.#obj;

    for (const key of keys) {
      target = (target as Record<string, unknown>)[key];
    }

    return target as T;
  }

  async parseOperations(context: ParseContext): Promise<Operation[]> {
    const paths = Object.entries(this.#obj.paths ?? {});

    const operations = paths.flatMap(([path, pathItem]) =>
      httpMethods.flatMap((method) => {
        const operation = pathItem?.[method];
        return operation ? { path, pathItem, method, operation } : [];
      })
    );

    const promises = operations.map(
      async ({ path, pathItem, method, operation }) => {
        const operationId = operation.operationId ?? null;

        const parameters = await this.#parseParameters(
          [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])],
          context
        );

        const requestTypes = await this.#parseRequestBody(
          operation.requestBody,
          context
        );

        const responseTypes = await this.#parseResponses(
          operation.responses,
          context
        );

        return {
          operationId,
          path,
          method,
          parameters,
          requestTypes,
          responseTypes,
        };
      }
    );

    return await Promise.all(promises);
  }

  async #parseParameters(
    parameters: (oa.ParameterObject | oa.ReferenceObject)[],
    context: ParseContext
  ): Promise<Operation["parameters"]> {
    const deref = await Promise.all(
      parameters.map(async (o) => {
        if ("$ref" in o) {
          const url = new URL(o.$ref, this.#url);
          return await context.unref<oa.ParameterObject>(url);
        }
        return o;
      })
    );

    const derefPath = deref.filter((o) => o.in === "path");
    const derefQuery = deref.filter((o) => o.in === "query");

    const path = derefPath.length
      ? await this.#parseParameterArray(derefPath, context)
      : null;
    const query = derefQuery.length
      ? await this.#parseParameterArray(derefQuery, context)
      : null;

    return { path, query };
  }

  async #parseParameterArray(
    parameters: oa.ParameterObject[],
    context: ParseContext
  ): Promise<TObject> {
    const propertyPromises = parameters.map<Promise<TObjectProperty>>(
      async (parameter) => ({
        name: parameter.name,
        required: parameter.required ?? false,
        schema: await this.parseSchema(parameter.schema, context),
      })
    );

    const properties = await Promise.all(propertyPromises);

    return { type: "object", properties };
  }

  async #parseRequestBody(
    requestBody: oa.RequestBodyObject | oa.ReferenceObject | undefined,
    context: ParseContext
  ): Promise<RequestType[]> {
    const dereferenced =
      requestBody && "$ref" in requestBody
        ? await context.unref<oa.RequestBodyObject>(
            new URL(requestBody.$ref, this.#url)
          )
        : requestBody;

    const entires = Object.entries(dereferenced?.content ?? {});

    return await Promise.all(
      entires.map(async ([mediaType, obj]) => ({
        mediaType,
        schema: await this.parseSchema(obj.schema, context),
      }))
    );
  }

  async #parseResponses(
    responses: oa.ResponsesObject,
    context: ParseContext
  ): Promise<ResponseType[]> {
    const dereferenced = await Promise.all(
      Object.entries(responses).map(async ([status, obj]) => ({
        status: Number(status),
        responseObject:
          "$ref" in obj
            ? await context.unref<oa.ResponseObject>(
                new URL(obj.$ref, this.#url)
              )
            : obj,
      }))
    );

    const promises = await Promise.all(
      dereferenced.map(async ({ status, responseObject: { content } }) => {
        if (!content) {
          const responseType: ResponseType = {
            status,
            schema: await this.parseSchema(null, context),
          };
          return responseType;
        }

        const responseTypes: ResponseType[] = await Promise.all(
          Object.entries(content).map(async ([mediaType, obj]) => ({
            status,
            mediaType,
            schema: await this.parseSchema(obj.schema, context),
          }))
        );

        return responseTypes;
      })
    );

    return (await Promise.all(promises)).flat();
  }

  async parseSchema(
    schema: oa.SchemaObject | oa.ReferenceObject | null | undefined,
    context: ParseContext
  ): Promise<SchemaAst> {
    if (!schema) {
      return { type: "atom", name: "void" };
    }

    if ("$ref" in schema) {
      const url = new URL(schema.$ref, this.#url);
      await context.reportRefSchemaUrl(url);
      return { type: "ref", url: url.toString() };
    }

    if (schema.allOf) {
      return {
        type: "intersection",
        children: await Promise.all(
          schema.allOf.map((s) => this.parseSchema(s, context))
        ),
      };
    }

    if (schema.oneOf) {
      return {
        type: "union",
        children: await Promise.all(
          schema.oneOf.map((s) => this.parseSchema(s, context))
        ),
      };
    }

    if (schema.anyOf) {
      return {
        type: "union",
        children: await Promise.all(
          schema.anyOf.map((s) => this.parseSchema(s, context))
        ),
      };
    }

    if (Array.isArray(schema.type)) {
      return {
        type: "union",
        children: await Promise.all(
          schema.type.map((type) =>
            this.parseSchema({ ...schema, type } as oa.SchemaObject, context)
          )
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
        return { type: "enum", cases: schema.enum as string[] };
      } else {
        return { type: "atom", name: "number" };
      }
    }

    if (schema.type === "string") {
      if (schema.enum) {
        return {
          type: "enum",
          cases: schema.enum.map((e) => JSON.stringify(e)),
        };
      } else {
        return { type: "atom", name: "string" };
      }
    }

    if (schema.type === "array") {
      if (schema.items) {
        return {
          type: "array",
          child: await this.parseSchema(schema.items, context),
        };
      } else {
        return { type: "array", child: { type: "atom", name: "unknown" } };
      }
    }

    if (schema.type === "object") {
      if (schema.properties) {
        return {
          type: "object",
          properties: await Promise.all(
            Object.entries(schema.properties).map(
              async ([name, childSchema]) => ({
                name,
                schema: await this.parseSchema(childSchema, context),
                required: schema.required?.includes(name) ?? false,
              })
            )
          ),
        };
      } else {
        return { type: "atom", name: "object" };
      }
    }

    return { type: "atom", name: "unknown" };
  }
}
