export type SchemaAst =
  | TRef
  | TAtom
  | TIntersection
  | TUnion
  | TEnum
  | TArray
  | TObject;

export interface TAbstract {
  readonly type: string;
}

export interface TRef extends TAbstract {
  readonly type: "ref";
  readonly url: string;
}

export interface TAtom extends TAbstract {
  readonly type: "atom";
  readonly name:
    | "unknown"
    | "void"
    | "null"
    | "boolean"
    | "number"
    | "string"
    | "object";
}

export interface TIntersection extends TAbstract {
  readonly type: "intersection";
  readonly children: SchemaAst[];
}

export interface TUnion extends TAbstract {
  readonly type: "union";
  readonly children: SchemaAst[];
}

export interface TEnum extends TAbstract {
  readonly type: "enum";
  readonly cases: string[];
}

export interface TArray extends TAbstract {
  readonly type: "array";
  readonly child: SchemaAst;
}

export interface TObject extends TAbstract {
  readonly type: "object";
  readonly properties: TObjectProperty[];
}

export interface TObjectProperty {
  readonly name: string;
  readonly schema: SchemaAst;
  readonly required: boolean;
}
