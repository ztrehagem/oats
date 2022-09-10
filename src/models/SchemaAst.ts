export type SchemaAst =
  | TRef
  | TAtom
  | TIntersection
  | TUnion
  | TEnum
  | TArray
  | TObject;

export interface TAbstract {
  type: string;
}

export interface TRef extends TAbstract {
  type: "ref";
  url: string;
}

export interface TAtom extends TAbstract {
  type: "atom";
  name:
    | "unknown"
    | "void"
    | "null"
    | "boolean"
    | "number"
    | "string"
    | "object";
}

export interface TIntersection extends TAbstract {
  type: "intersection";
  children: SchemaAst[];
}

export interface TUnion extends TAbstract {
  type: "union";
  children: SchemaAst[];
}

export interface TEnum extends TAbstract {
  type: "enum";
  cases: string[];
}

export interface TArray extends TAbstract {
  type: "array";
  child: SchemaAst;
}

export interface TObject extends TAbstract {
  type: "object";
  properties: TObjectProperty[];
}

export interface TObjectProperty {
  name: string;
  schema: SchemaAst;
  required: boolean;
}
