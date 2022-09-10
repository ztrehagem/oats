import * as fs from "fs/promises";
import * as jsYaml from "js-yaml";
import { OpenAPIV3_1 as oa } from "openapi-types";
import { Document } from "./Document.js";
import { NamedSchema } from "./models/NamedSchema.js";
import { Operation } from "./models/Operation.js";
import { ParseContext } from "./models/ParseContext.js";
import { createSchemaName } from "./utils/createSchemaName.js";

export interface ParserOptions {
  entryUrl: string;
}

export interface ParseResult {
  operations: Operation[];
  schemas: Map<string, NamedSchema>;
}

export class Parser {
  readonly #entryUrl: URL;
  readonly #documents = new Map<string, Document>();
  readonly #schemas = new Map<string, NamedSchema>();

  constructor(options: ParserOptions) {
    this.#entryUrl = new URL(
      options.entryUrl,
      new URL(process.cwd() + "/", import.meta.url)
    );
  }

  async parse(): Promise<ParseResult> {
    const doc = await this.#getDocument(this.#entryUrl);

    const operations = await doc.parseOperations(this.#context);

    return { operations, schemas: this.#schemas };
  }

  async #getDocument(url: URL): Promise<Document> {
    let doc = this.#documents.get(url.toString());
    if (doc) return doc;
    doc = await this.#loadDocument(url);
    this.#documents.set(url.toString(), doc);
    return doc;
  }

  async #loadDocument(url: URL): Promise<Document> {
    const buf = await fs.readFile(url.pathname);
    const raw = buf.toString();

    let obj: unknown;

    if (/\.ya?ml$/i.test(url.pathname)) {
      obj = jsYaml.load(raw);
    } else {
      obj = JSON.parse(raw);
    }

    return new Document({ url, obj: obj as oa.Document });
  }

  readonly #unref = async <T>(url: URL): Promise<T> => {
    const refDoc = await this.#getDocument(url);
    return refDoc.query<T>(url.hash.slice(1));
  };

  readonly #addSchema = async (url: URL): Promise<void> => {
    const key = url.toString();
    if (this.#schemas.has(key)) return;

    const refDoc = await this.#getDocument(url);
    const obj = refDoc.query<oa.SchemaObject>(url.hash.slice(1));
    const schema = await refDoc.parseSchema(obj, this.#context);
    const name = createSchemaName(url, obj);
    this.#schemas.set(key, { name, schema });
  };

  readonly #context: ParseContext = {
    unref: this.#unref,
    addSchema: this.#addSchema,
  };
}
