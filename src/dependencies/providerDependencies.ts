import ts, { NamedImportBindings, ImportSpecifier, ParameterDeclaration, SourceFile, Identifier, ImportClause } from "typescript";
import { PathForImports } from "./DependencyObj.model";

let providerObj: PathForImports;

function getProviderDependencies(constructorParams: ts.NodeArray<ParameterDeclaration>, sourceFile: SourceFile): PathForImports {
  providerObj = {};
  constructorParams.forEach((param: any) => {
    const typeName: Identifier = param.type.typeName;
    
    if (typeName) {
      const provider: string = typeName.text;
      findProviderDependencies(provider, sourceFile);
    }
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