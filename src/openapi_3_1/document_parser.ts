import { camelCase } from "camel-case";
import { OpenAPIV3_1 as oa } from "openapi-types";
import * as ast from "../schema/ast";
import { parse as parseSchemaObject } from "./schema_object_parser";

const httpMethods = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;

export type HttpMethod = typeof httpMethods[number];

export type ParsedParameters = {
  path: ast.TObject | null;
  query: ast.TObject | null;
};

export type ParsedRequestBody = {
  mediaType: string;
  schema: ast.Ast;
};

export type ParsedResponse = {
  status: string;
  mediaType?: string;
  schema: ast.Ast;
};

export type ParsedOperation = {
  operationId: string;
  path: string;
  method: HttpMethod;
  parameters: ParsedParameters;
  requestBody: ParsedRequestBody[];
  responses: ParsedResponse[];
};

type FlattenOperationObject = {
  path: string;
  pathObject: oa.PathItemObject;
  method: HttpMethod;
  operationObject: oa.OperationObject;
};

type FlattenResponseObject = {
  status: string;
  mediaType?: string;
  mediaTypeObject?: oa.MediaTypeObject;
};

export type ParsedSchema = {
  name: string;
  schema: ast.Ast;
};

export type ParsedDocument = {
  schemas: ParsedSchema[];
  operations: ParsedOperation[];
};

export type Unref = <T>(refString: string) => T;

export type DocumentParserOptions = {
  unref?: Unref;
};

export class DocumentParser {
  readonly document: oa.Document;
  readonly unref: Unref;

  constructor(document: oa.Document, options: DocumentParserOptions = {}) {
    this.document = document;
    this.unref = options.unref ?? ((s) => unref(s, document));
  }

  parse(): ParsedDocument {
    return {
      schemas: this.parseSchemas(this.document.components?.schemas ?? {}),
      operations: this.parsePaths(this.document.paths ?? {}),
    };
  }

  private parsePaths(paths: oa.PathsObject): ParsedOperation[] {
    const flatten: FlattenOperationObject[] = Object.entries(paths).flatMap(
      ([path, pathObject]) =>
        httpMethods.flatMap((method) => {
          const operationObject = pathObject?.[method];
          if (!operationObject) return [];

          return { path, pathObject, method, operationObject };
        })
    );

    return flatten.map((operation) => {
      const {
        path,
        method,
        operationObject: { operationId, requestBody, responses },
      } = operation;

      return {
        operationId: operationId ?? getFallbackOperationId(method, path),
        path,
        method,
        parameters: this.parseParameters(operation),
        requestBody: requestBody ? this.parseRequestBody(requestBody) : [],
        responses: this.parseResponses(responses ?? {}),
      };
    });
  }

  private parseParameters(operation: FlattenOperationObject): ParsedParameters {
    const all = [
      ...(operation.pathObject.parameters ?? []),
      ...(operation.operationObject.parameters ?? []),
    ];

    const dereferenced = all.map((o) =>
      "$ref" in o ? this.unref<oa.ParameterObject>(o.$ref) : o
    );

    const pathParams = dereferenced.filter((o) => o.in === "path");
    const queryParams = dereferenced.filter((o) => o.in === "query");

    return {
      path: this.parseParameterObjects(pathParams),
      query: this.parseParameterObjects(queryParams),
    };
  }

  private parseParameterObjects(raw: oa.ParameterObject[]): ast.TObject | null {
    if (!raw.length) return null;

    const properties: ast.ObjectProperty[] = raw.map((o) => ({
      name: o.name,
      required: o.required ?? false,
      schema: parseSchemaObject(o.schema),
    }));

    return { type: "object", properties };
  }

  private parseRequestBody(
    raw: oa.RequestBodyObject | oa.ReferenceObject
  ): ParsedRequestBody[] {
    const dereferenced =
      "$ref" in raw ? this.unref<oa.RequestBodyObject>(raw.$ref) : raw;

    return Object.entries(dereferenced.content).map(
      ([mediaType, mediaTypeObject]) => ({
        mediaType,
        schema: parseSchemaObject(mediaTypeObject.schema),
      })
    );
  }

  private parseResponses(raw: oa.ResponsesObject): ParsedResponse[] {
    const dereferences = Object.entries(raw).map(([status, o]) => ({
      status,
      responseObject: "$ref" in o ? this.unref<oa.ResponseObject>(o.$ref) : o,
    }));

    const flatten: FlattenResponseObject[] = dereferences.flatMap(
      ({ status, responseObject }) => {
        if (!responseObject.content) {
          return { status };
        }

        return Object.entries(responseObject.content).map(
          ([mediaType, mediaTypeObject]) => ({
            status,
            mediaType,
            mediaTypeObject,
          })
        );
      }
    );

    return flatten.map(({ status, mediaType, mediaTypeObject }) => ({
      status,
      mediaType,
      schema: parseSchemaObject(mediaTypeObject?.schema),
    }));
  }

  private parseSchemas(
    schemas: Record<string, oa.SchemaObject>
  ): ParsedSchema[] {
    return Object.entries(schemas ?? {}).map(([name, schema]) => ({
      name,
      schema: parseSchemaObject(schema),
    }));
  }
}

export const unref = <T>(refString: string, document: oa.Document): T => {
  if (!refString.startsWith("#/")) {
    throw new Error(`Unsupported ref string: ${refString}`);
  }

  const keys = refString.slice(2).split("/");

  let target: unknown = document;

  for (const key of keys) {
    target = (target as Record<string, unknown>)[key];
  }

  return target as T;
};

const getFallbackOperationId = (method: string, path: string): string => {
  return camelCase(method + "_" + path.replaceAll(/[^\w\d]/gi, "_"));
};
