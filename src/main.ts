import { Parser, ParseResult } from "./Parser.js";
export { TypeStringGenerator } from "./TypeStringGenerator.js";

export const parse = async (fileUrl: string): Promise<ParseResult> => {
  const parser = new Parser({ entryUrl: fileUrl });
  return await parser.parse();
};
