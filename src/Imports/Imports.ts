import ts, { ImportDeclaration } from 'typescript';
import DependencyObj from '../dependencies/DependencyObj.model';


function getImportDeclaration(path: string, names): ImportDeclaration {
  const nonDefaultImports = [];
  let defaultImport;
  for (const key in names) {
    if (key !== 'default') {
      nonDefaultImports.push(ts.createImportSpecifier(undefined, ts.createIdentifier(key)));
    } else {
      defaultImport = ts.createIdentifier(names[key]);
    }
  }

  return ts.createImportDeclaration(undefined, undefined, getImportClause(defaultImport, nonDefaultImports), ts.createLiteral(path));
}

function getImportClause(defaultImport, nonDefaultImports) {
  if (defaultImport && nonDefaultImports.length) {
    return ts.createImportClause(defaultImport, ts.createNamedImports(nonDefaultImports));
  } else if (!defaultImport && nonDefaultImports.length) {
    return ts.createImportClause(undefined, ts.createNamedImports(nonDefaultImports));
  } else if (defaultImport && !nonDefaultImports.length) {
    return ts.createImportClause(defaultImport, undefined);
  }
}

function getImportsTemplate(dependencyObj: DependencyObj): ImportDeclaration[] {
  const result = [];
  for (const path in dependencyObj) {
    result.push(getImportDeclaration(path, dependencyObj[path]));
  }

  return result;
}

export default getImportsTemplate;

