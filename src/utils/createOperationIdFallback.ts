import { camelCase } from "camel-case";

export const createFallbackOperationId = (
  method: string,
  path: string
): string => {
  return camelCase(method + "_" + path.replace(/[^\w\d]/gi, "_"));
};
