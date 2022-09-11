import { Unref } from "./Unref.js";

export interface ParseContext {
  readonly unref: Unref;
  readonly reportRefSchemaUrl: (url: URL) => Promise<void>;
}
