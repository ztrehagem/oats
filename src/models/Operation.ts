import { HttpMethod } from "./HttpMethod.js";
import { SchemaAst, TObject } from "./SchemaAst.js";

export interface Operation {
  operationId: string;
  path: string;
  method: HttpMethod;
  parameters: {
    path: TObject | null;
    query: TObject | null;
  };
  requestTypes: RequestType[];
  responseTypes: ResponseType[];
}

export interface RequestType {
  mediaType: string;
  schema: SchemaAst;
}

export interface ResponseType {
  status: number;
  mediaType?: string;
  schema: SchemaAst;
}
