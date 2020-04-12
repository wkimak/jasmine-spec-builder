import ts, { SourceFile, ClassDeclaration, Block, FunctionDeclaration, ConstructorDeclaration } from 'typescript';
import { Stub } from './interfaces/Stub';
import { Import } from './interfaces/Import';
import { findProviderPath, findRelativeStubPath, removePathExtension } from './pathHelpers';
import fs from 'fs';
import getDescribe from './templates/describe';
import getMasterServiceInit from './templates/masterServiceInit';
import getImport from './templates/import';


class SpecFileBuilder {
  targetFile: SourceFile;
  sourceFile: SourceFile;
  classNode: ClassDeclaration;
  mainDescribeBody: Block;
  imports: Import = {};

  // Differences
  // Services
  // Configuration is different:
  // no Declarations array
  // Service is listed as a provider
  // potential to add imports specific to services (FormsModule)
  // potential to add form field describe blocks

  // resources
  // Configuration is different:
  // no Declarations array
  // Resource is listed as a provider
  // potential to add imports specific to resources (HttpRequestModule) 
  // potential to add http request describe blocks based on HTTP verbs 

  protected setSourceFiles(componentFileName: string, specFileName: string): void {
    this.targetFile = ts.createSourceFile(specFileName, "", ts.ScriptTarget.Latest, false);
    this.sourceFile = ts.createSourceFile(
      componentFileName,
      fs.readFileSync(`${process.cwd()}/${componentFileName}`, 'utf8'),
      ts.ScriptTarget.Latest
    );;
  }

  protected buildDescribes(sourceFile: ClassDeclaration, targetFile: Block): void;
  protected buildDescribes(sourceFile: SourceFile, targetFile: SourceFile): void
  protected buildDescribes(sourceFile, targetFile) {
    ts.forEachChild(sourceFile, childNode => {
      if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
        const node = <ClassDeclaration | FunctionDeclaration>childNode;
        targetFile.statements = ts.createNodeArray([...targetFile.statements, getDescribe(node.name.text)]);
      }

      if (ts.isClassDeclaration(childNode)) {
        this.classNode = childNode;
        this.mainDescribeBody = targetFile.statements[targetFile.statements.length - 1].expression.arguments[1].body;
        this.buildDescribes(childNode, this.mainDescribeBody);
      }
    });
  }

  protected generateStubs(useMasterServiceStub: boolean): Stub[] {
    for (const member of this.classNode.members) {
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

  protected generateMasterServiceStubs(constructor: ConstructorDeclaration): Stub[] {
    const stubs: Stub[] = [];
    const stubName: string = 'MasterServiceStub';
    this.addImport(findRelativeStubPath(stubName), stubName);
    constructor.parameters.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName: string = `masterServiceStub.${provider.slice(0, 1).toLowerCase() + provider.slice(1)}Stub`;
      stubs.push({ provider, class: stubName });
      this.addImport(findProviderPath(this.sourceFile, provider), provider)
    });
    return stubs;
  }

  protected generateNonMasterServiceStubs(constructor: ConstructorDeclaration): Stub[] {
    const stubs: Stub[] = [];
    constructor.parameters.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName: string = provider + 'Stub';
      stubs.push({ provider, class: stubName });
      this.addImport(findProviderPath(this.sourceFile, provider), provider);
      this.addImport(findRelativeStubPath(stubName), stubName);
    });
    return stubs;
  }

  protected buildImports(): void {
    this.prependImport(['TestBed', 'async'], '@angular/core/testing');
    this.prependImport([this.classNode.name.text], `./${removePathExtension(this.sourceFile.fileName)}`);
    for (const path in this.imports) {
      this.prependImport(this.imports[path], path);
    }
  }

  protected buildMasterServiceDeclaration(): void {
    this.mainDescribeBody.statements = ts.createNodeArray([getMasterServiceInit(), ...this.mainDescribeBody.statements]);
  }

  private addImport(path: string, name: string): void {
    if (!this.imports.hasOwnProperty(path)) {
      this.imports[path] = [name];
    } else {
      this.imports[path].push(name);
    }
  }

  private prependImport(names: string[], path: string): void {
    this.targetFile.statements = ts.createNodeArray([getImport(names, path), ...this.targetFile.statements]);
  }
}

export default SpecFileBuilder;
