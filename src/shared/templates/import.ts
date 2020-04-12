import ts, { ImportDeclaration } from "typescript";

export default function getImport(importNames: string[], path: string): ImportDeclaration {
  const properties = [];
  importNames.forEach(name => properties.push(ts.createIdentifier(name)));
  return ts.createImportDeclaration(undefined, undefined, ts.createImportClause(
    <any>ts.createObjectLiteral(properties), undefined), ts.createLiteral(path));
}