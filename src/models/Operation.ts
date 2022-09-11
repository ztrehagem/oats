import { HttpMethod } from "./HttpMethod.js";
import { SchemaAst, TObject } from "./SchemaAst.js";

export interface Operation {
  readonly operationId: string;
  readonly path: string;
  readonly method: HttpMethod;
  readonly parameters: {
    readonly path: TObject | null;
    readonly query: TObject | null;
  };
  readonly requestTypes: RequestType[];
  readonly responseTypes: ResponseType[];
}

export interface RequestType {
  readonly mediaType: string;
  readonly schema: SchemaAst;
}

export interface ResponseType {
  readonly status: number;
  readonly mediaType?: string;
  readonly schema: SchemaAst;
}
