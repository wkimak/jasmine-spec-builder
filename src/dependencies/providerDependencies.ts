import ts, { NamedImportBindings, ImportSpecifier, ParameterDeclaration, SourceFile, Identifier, ImportClause, ImportDeclaration } from "typescript";
import { DependencyObj } from "./DependencyObj.model";

let providerObj: DependencyObj;

function getProviderDependencies(constructorParams: ts.NodeArray<ParameterDeclaration>, sourceFile: SourceFile): DependencyObj {
  providerObj = {};
  constructorParams.forEach((param: any) => {
    const provider: string = param.type.typeName.text;
    findProviderDependencies(provider, sourceFile);
  });
  return providerObj;
}

function findProviderDependencies(provider: string, sourceFile: SourceFile): void {
  for (const childNode of sourceFile.statements) {
    if (ts.isImportDeclaration(childNode)) {
      const importClause: ImportClause = childNode.importClause;
      const namedBindings: NamedImportBindings = importClause.namedBindings;
      const defaultImport: Identifier = importClause.name;
      const providerPath: string = (<any>childNode.moduleSpecifier).text;

      if (namedBindings) {
        setNamedBindings(namedBindings, provider, providerPath);
      }

      if (defaultImport) {
        setDefaultImport(defaultImport, provider, providerPath);
      }
    }
  }
}

function setNamedBindings(namedBindings: NamedImportBindings, provider: string, providerPath: string): void {
  const imports: ts.NodeArray<ImportSpecifier> = (<any>namedBindings).elements;
  for (const node of imports) {
    if (node.name.text === provider && !providerObj[providerPath]) {
      providerObj[providerPath] = { [provider]: provider };
    } else if (node.name.text === provider) {
      providerObj[providerPath] = { ...providerObj[providerPath], [provider]: provider };
    }
  }
}

function setDefaultImport(defaultImport: Identifier, provider: string, providerPath: string): void {
  if (provider === defaultImport.text && !providerObj[providerPath]) {
    providerObj[providerPath] = { default: provider };
  } else if (provider === defaultImport.text) {
    providerObj[providerPath] = { default: provider, ...providerObj[providerPath] };
  }
}

export default getProviderDependencies;