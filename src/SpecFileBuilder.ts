import ts, { SourceFile, ClassDeclaration, Block, FunctionDeclaration, ConstructorDeclaration } from 'typescript';
import { getDescribe, getImport, getConfiguration, getMasterServiceInit } from './templates';
import { Stub } from './interfaces/Stub';
import { Import } from './interfaces/Import';
import { findProviderPath, findRelativeStubPath, removePathExtension } from './pathHelpers';
import fs from 'fs';


export class SpecFileBuilder {
  specFile: SourceFile;
  componentFile: SourceFile;
  componentClassNode: ClassDeclaration;
  mainDescribeBody: Block;
  imports: Import = {};

  constructor(componentFileName: string, specFileName: string, useMasterServiceStub: boolean) {
    this.setSourceFiles(componentFileName, specFileName);
    this.buildDescribes(this.componentFile, this.specFile);
    this.buildConfiguration(this.generateStubs(useMasterServiceStub), useMasterServiceStub);
    this.buildImports();
    useMasterServiceStub && this.buildMasterServiceDeclaration();
  }

  private setSourceFiles(componentFileName: string, specFileName: string): void {
    this.specFile = ts.createSourceFile(specFileName, "", ts.ScriptTarget.Latest, false);
    this.componentFile = ts.createSourceFile(
      componentFileName,
      fs.readFileSync(`${process.cwd()}/${componentFileName}`, 'utf8'),
      ts.ScriptTarget.Latest
    );;
  }

  private buildDescribes(componentFile: ClassDeclaration, specFile: Block): void;
  private buildDescribes(componentFile: SourceFile, specFile: SourceFile): void
  private buildDescribes(componentFile, specFile) {
    ts.forEachChild(componentFile, childNode => {
      if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
        const node = <ClassDeclaration | FunctionDeclaration>childNode;
        specFile.statements = ts.createNodeArray([...specFile.statements, getDescribe(node.name.text)]);
      }

      if (ts.isClassDeclaration(childNode)) {
        this.componentClassNode = childNode;
        this.mainDescribeBody = specFile.statements[specFile.statements.length - 1].expression.arguments[1].body;
        this.buildDescribes(childNode, this.mainDescribeBody);
      }
    });
  }

  private generateStubs(useMasterServiceStub: boolean): Stub[] {
    for (const member of this.componentClassNode.members) {
      if (ts.isConstructorDeclaration(member)) {
        if (useMasterServiceStub) {
          return this.generateMasterServiceStubs(member);
        } else {
          return this.generateNonMasterServiceStubs(member)
        }
      }
    }
    return [];
  }

  private generateMasterServiceStubs(constructor: ConstructorDeclaration): Stub[] {
    const stubs: Stub[] = [];
    const stubName: string = 'MasterServiceStub';
    this.addImport(findRelativeStubPath(stubName), stubName);
    constructor.parameters.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName: string = `masterServiceStub.${provider.slice(0, 1).toLowerCase() + provider.slice(1)}Stub`;
      stubs.push({ provider, class: stubName });
      this.addImport(findProviderPath(this.componentFile, provider), provider)
    });
    return stubs;
  }

  private generateNonMasterServiceStubs(constructor: ConstructorDeclaration): Stub[] {
    const stubs: Stub[] = [];
    constructor.parameters.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName: string = provider + 'Stub';
      stubs.push({ provider, class: stubName });
      this.addImport(findProviderPath(this.componentFile, provider), provider);
      this.addImport(findRelativeStubPath(stubName), stubName);
    });
    return stubs;
  }

  private buildConfiguration(stubs: Stub[], useMasterServiceStub: boolean): void {
    const config = getConfiguration(stubs, this.componentClassNode.name.text, useMasterServiceStub);
    this.mainDescribeBody.statements = ts.createNodeArray([config, ...this.mainDescribeBody.statements]);
  }

  private buildImports(): void {
    this.prependImport(['TestBed', 'async'], '@angular/core/testing');
    this.prependImport([this.componentClassNode.name.text], `./${removePathExtension(this.componentFile.fileName)}`);
    for (const path in this.imports) {
      this.prependImport(this.imports[path], path);
    }
  }

  private addImport(path: string, name: string) {
    if (!this.imports.hasOwnProperty(path)) {
      this.imports[path] = [name];
    } else {
      this.imports[path].push(name);
    }
  }

  private prependImport(names: string[], path: string): void {
    this.specFile.statements = ts.createNodeArray([getImport(names, path), ...this.specFile.statements]);
  }

  private buildMasterServiceDeclaration(): void {
    this.mainDescribeBody.statements = ts.createNodeArray([getMasterServiceInit(), ...this.mainDescribeBody.statements]);
  }
}

export default SpecFileBuilder;
