import ts, { NamedImportBindings, ImportSpecifier } from "typescript";

let providerObj;

export function getProviderDependencies(constructorParams, sourceFile) {
  providerObj = {};
  constructorParams.forEach((param: any) => {
    const provider: string = param.type.typeName.text;
    findProviderDependencies(provider, sourceFile);
  });
  return providerObj;
}

function findProviderDependencies(provider: string, sourceFile): any {
  for (const childNode of sourceFile.statements) {
    if (ts.isImportDeclaration(childNode)) {
      const namedBindings: NamedImportBindings = childNode.importClause.namedBindings;
      const defaultImport = childNode.importClause.name;

      if (namedBindings) {
        setNamedBindings(namedBindings, provider, childNode);
      }

      if (defaultImport) {
        setDefaultImport(defaultImport, provider, childNode);
      }
    }
  }
}

function setNamedBindings(namedBindings, provider, childNode) {
  const imports: ts.NodeArray<ImportSpecifier> = (<any>namedBindings).elements;
  for (const node of imports) {
    const providerPath = (<any>childNode.moduleSpecifier).text;
    if (node.name.text === provider && !providerObj[providerPath]) {
      providerObj[providerPath] = { [provider]: provider };
    } else if (node.name.text === provider) {
      providerObj[providerPath] = { ...providerObj[providerPath], [provider]: provider };
    }
  }
}

function setDefaultImport(defaultImport, provider, childNode) {
  const providerPath = (<any>childNode.moduleSpecifier).text;
  if (provider === defaultImport.text && !providerObj[providerPath]) {
    providerObj[providerPath] = { default: provider };
  } else if (provider === defaultImport.text) {
    providerObj[providerPath] = { default: provider, ...providerObj[providerPath] };
  }
}