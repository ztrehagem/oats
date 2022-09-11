import { OpenAPIV3_1 as oa } from "openapi-types";
import { NamedSchema } from "../models/NamedSchema.js";
import { ParseContext } from "../models/ParseContext.js";
import { ParsedDocument } from "../models/ParsedDocument.js";
import { createSchemaName } from "../utils/createSchemaName.js";
import { DocumentLoader } from "../models/DocumentLoader.js";

export interface RootDocumentOptions {
  url: URL;
  documentLoader: DocumentLoader;
}

export class RootDocument {
  readonly #url: URL;
  readonly #documentLoader: DocumentLoader;
  readonly #schemas = new Map<string, NamedSchema>();

  constructor(options: RootDocumentOptions) {
    this.#url = options.url;
    this.#documentLoader = options.documentLoader;
  }

  async parse(): Promise<ParsedDocument> {
    const doc = await this.#documentLoader.get(this.#url);
    const operations = await doc.parseOperations(this.#context);

    return {
      operations,
      schemas: new Map(this.#schemas),
    };
  }

  readonly #unref = async <T>(url: URL): Promise<T> => {
    const doc = await this.#documentLoader.get(url);
    return doc.query<T>(url.hash.slice(1));
  };

  readonly #reportRefSchemaUrl = async (url: URL): Promise<void> => {
    const key = url.toString();
    if (this.#schemas.has(key)) return;

    const doc = await this.#documentLoader.get(url);
    const obj = doc.query<oa.SchemaObject>(url.hash.slice(1));
    const schema = await doc.parseSchema(obj, this.#context);
    const name = createSchemaName(url, obj);
    this.#schemas.set(key, { name, schema });
  };

  readonly #context: ParseContext = {
    unref: this.#unref,
    reportRefSchemaUrl: this.#reportRefSchemaUrl,
  };
}
