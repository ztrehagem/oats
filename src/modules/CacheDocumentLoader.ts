import * as fs from "fs/promises";
import * as jsYaml from "js-yaml";
import { OpenAPIV3_1 as oa } from "openapi-types";
import { Document } from "./Document.js";
import { DocumentLoader } from "../models/DocumentLoader.js";

export class CacheDocumentLoader implements DocumentLoader {
  readonly #documents = new Map<string, Document>();

  static #shared?: CacheDocumentLoader;

  static get shared(): CacheDocumentLoader {
    return (this.#shared ??= new CacheDocumentLoader());
  }

  async get(url: URL): Promise<Document> {
    url = new URL(url.pathname + url.search, url);
    const key = url.toString();

    const cached = this.#documents.get(key);
    if (cached) return cached;

    const loaded = await this.#load(url);
    this.#documents.set(key, loaded);
    return loaded;
  }

  async #load(url: URL): Promise<Document> {
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
}
