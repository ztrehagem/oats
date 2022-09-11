import { SchemaAst } from "./SchemaAst.js";

export interface NamedSchema {
  readonly name: string | null;
  readonly schema: SchemaAst;
}
