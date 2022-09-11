import { Document } from "../modules/Document.js";

export interface DocumentLoader {
  get({ origin, pathname, search }: URL): Promise<Document>;
}
