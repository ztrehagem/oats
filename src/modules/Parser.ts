import { DocumentLoader } from "../models/DocumentLoader.js";
import { ParsedDocument } from "../models/ParsedDocument.js";
import { CacheDocumentLoader } from "./CacheDocumentLoader.js";
import { RootDocument } from "./RootDocument.js";

export interface ParserOptions {
  documentLoader?: DocumentLoader;
}

export class Parser {
  readonly #documentLoader: DocumentLoader;

  constructor(options: ParserOptions = {}) {
    this.#documentLoader = options.documentLoader ?? CacheDocumentLoader.shared;
  }

  async parse(urlString: string): Promise<ParsedDocument> {
    const url = new URL(
      urlString,
      new URL(process.cwd() + "/", import.meta.url)
    );

    const document = new RootDocument({
      url,
      documentLoader: this.#documentLoader,
    });

    const parsed = await document.parse();

    return parsed;
  }
}
