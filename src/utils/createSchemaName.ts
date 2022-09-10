import * as path from "path";
import { OpenAPIV3_1 as oa } from "openapi-types";

export const createSchemaName = (
  url: URL,
  schemaObj: oa.SchemaObject
): string | null => {
  const title = schemaObj?.title;
  if (title) return title;

  const componentName = url.hash.split("/").pop();
  if (componentName) return componentName;

  const fileName = path.parse(url.pathname).name;
  if (fileName) return fileName;

  return null;
};
