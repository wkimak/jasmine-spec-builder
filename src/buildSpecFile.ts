import ts, { SourceFile, ClassDeclaration, Block, FunctionDeclaration, ImportSpecifier, NamedImports, StringLiteral } from 'typescript';
import fs from 'fs';
import path from 'path';
import { getDescribe, getImport, getConfiguration, getMasterServiceInit } from './templates';
import { Stub } from './interfaces/Stub';

function prependImport(sourceFile: SourceFile, names: string[], path: string): void {
  sourceFile.statements = ts.createNodeArray([getImport(names, path), ...sourceFile.statements]);
}

function removePathExtension(path: string): string {
  return path.slice(0, -3);
}

function createSpecFile(componentFile: ClassDeclaration, specFile: Block, useMasterServiceStub: boolean): void;
function createSpecFile(componentFile: SourceFile, specFile: SourceFile, useMasterServiceStub: boolean): SourceFile;
function createSpecFile(componentFile, specFile, useMasterServiceStub) {
  ts.forEachChild(componentFile, childNode => {
    if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
      const node = <ClassDeclaration | FunctionDeclaration>childNode;
      specFile.statements = ts.createNodeArray([...specFile.statements, getDescribe(node.name.text)]);
    }

    if (ts.isClassDeclaration(childNode)) {
      const className: string = childNode.name.text;
      const body: Block = specFile.statements[specFile.statements.length - 1].expression.arguments[1].body;
      const stubs: Stub[] = createStubs(componentFile, childNode, specFile, useMasterServiceStub);
      body.statements = ts.createNodeArray([getMasterServiceInit(), getConfiguration(stubs, className, useMasterServiceStub)]);
      prependImport(specFile, ['TestBed', 'async'], '@angular/core/testing');
      prependImport(specFile, [className], `./${removePathExtension(componentFile.fileName)}`);
      createSpecFile(childNode, body, useMasterServiceStub);
    }
  });
  return specFile;
}

function createStubs(componentFile: SourceFile, classNode: ClassDeclaration, specFile: SourceFile, useMasterServiceStub: boolean): { provider: string, class: string }[] {
  const stubs: Stub[] = [];
  for (const childNode of classNode.members) {
    if (ts.isConstructorDeclaration(childNode)) {
      childNode.parameters.forEach((param: any) => {
        const provider: string = param.type.typeName.text;
        const stubName: string = useMasterServiceStub ? 'MasterServiceStub' : provider + 'Stub';
        stubs.push({ provider, class: useMasterServiceStub ? `masterServiceStub.${provider.toLowerCase()}Stub` : stubName });
        createRelativeStubPath(stubName, specFile);
        findImportForDI(specFile, componentFile, provider);
      });
      return stubs;
    }
  };

  return stubs;
}

function findImportForDI(specFile: SourceFile, componentFile: SourceFile, provider: string): void {
  for (const childNode of componentFile.statements) {
    if (ts.isImportDeclaration(childNode)) {
      const imports: ts.NodeArray<ImportSpecifier> = (<NamedImports>childNode.importClause.namedBindings).elements;
      const path: string = (<StringLiteral>childNode.moduleSpecifier).text;
      imports.forEach(node => {
        if (node.name.text === provider) {
          prependImport(specFile, [provider], path);
        }
      });
    }
  }
}

function createRelativeStubPath(stubName: string, specFile: SourceFile): void {
  const specPath = process.cwd();
  const stubPath = findStubPath(stubName, path.dirname(specPath));
  const relativePath = path.relative(specPath, stubPath);
  prependImport(specFile, [stubName], relativePath);
}

function findStubPath(stubName: string, currentPath: string): string {
  const excludedDirectories = {
    node_modules: true,
    dist: true,
    '.git': true
  };
  let fileFound: string;

  function inner(currentPath) {
    if (!fileFound) {
      const files: string[] = fs.readdirSync(currentPath);

      for (const file in files) {
        const currentFile: string = currentPath + '/' + files[file];
        const stats: fs.Stats = fs.statSync(currentFile);
        if (stats.isFile() && path.basename(currentFile) === stubName + '.ts') {
          fileFound = removePathExtension(currentFile);
        }
        else if (stats.isDirectory() && !excludedDirectories.hasOwnProperty(path.basename(currentPath))) {
          inner(currentFile);
        }
      }
    }
  }

  inner(currentPath);
  return fileFound;
}

export default createSpecFile;
