import { SchemaAst } from "./SchemaAst.js";

export interface NamedSchema {
  name: string | null;
  schema: SchemaAst;
}
