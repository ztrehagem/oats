export type Ast =
  | TRef
  | TAtom
  | TIntersection
  | TUnion
  | TEnum
  | TArray
  | TObject;

export interface TRef {
  type: "ref";
  ref: string;
}

export interface TAtom {
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

export interface TIntersection {
  type: "intersection";
  children: Ast[];
}

export interface TUnion {
  type: "union";
  children: Ast[];
}

export interface TEnum {
  type: "enum";
  cases: string[];
}

export interface TArray {
  type: "array";
  child: Ast;
}

export interface TObject {
  type: "object";
  properties: ObjectProperty[];
}

export interface ObjectProperty {
  name: string;
  schema: Ast;
  required: boolean;
}
