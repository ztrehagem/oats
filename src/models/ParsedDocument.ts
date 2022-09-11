import { NamedSchema } from "./NamedSchema.js";
import { Operation } from "./Operation.js";

export interface ParsedDocument {
  readonly operations: Operation[];
  readonly schemas: Map<string, NamedSchema>;
}
