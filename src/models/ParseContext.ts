import { Unref } from "./Unref.js";

export interface ParseContext {
  readonly unref: Unref;
  readonly addSchema: (url: URL) => Promise<void>;
}
