import ts, { ImportDeclaration, ImportSpecifier, ImportClause, Identifier } from 'typescript';
import { DependencyNames, DependencyObj } from '../dependencies/DependencyObj.model';


function getImportDeclarationTemplate(path: string, names: DependencyNames): ImportDeclaration {
  const nonDefaultImports: ImportSpecifier[] = [];
  let defaultImport: Identifier;
  for (const key in names) {
    if (key !== 'default') {
      nonDefaultImports.push(ts.createImportSpecifier(undefined, ts.createIdentifier(key)));
    } else {
      defaultImport = ts.createIdentifier(names[key]);
    }
  }

  return ts.createImportDeclaration(undefined, undefined, getImportClause(defaultImport, nonDefaultImports), ts.createLiteral(path));
}

function getImportClause(defaultImport: ts.Identifier, nonDefaultImports: ImportSpecifier[]): ImportClause {
  if (defaultImport && nonDefaultImports.length) {
    return ts.createImportClause(defaultImport, ts.createNamedImports(nonDefaultImports));
  } else if (!defaultImport && nonDefaultImports.length) {
    return ts.createImportClause(undefined, ts.createNamedImports(nonDefaultImports));
  } else if (defaultImport && !nonDefaultImports.length) {
    return ts.createImportClause(defaultImport, undefined);
  }
}

function getImportsTemplate(dependencyObj: DependencyObj): ImportDeclaration[] {
  const result: ImportDeclaration[] = [];
  for (const path in dependencyObj.pathsForImports) {
    result.push(getImportDeclarationTemplate(path, dependencyObj.pathsForImports[path]));
  }

  return result;
}

export default getImportsTemplate;

