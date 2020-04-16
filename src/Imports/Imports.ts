import ts, { SourceFile, ImportDeclaration, ClassDeclaration, ParameterDeclaration } from 'typescript';
import { findProviderPath, findRelativeStubPath, removePathExtension } from './pathHelpers';
import ImportsObj from './ImportsObjModel';

class ImportsBuilder {
  importsObj: ImportsObj;
  sourceFile: SourceFile;
  constructorParams: ts.NodeArray<ParameterDeclaration>;

  constructor(sourceFile: SourceFile, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    this.sourceFile = sourceFile;
    this.constructorParams = constructorParams;
    this.importsObj = {
      '@angular/core/testing': ['TestBed', 'async'],
      [`./${removePathExtension(sourceFile.fileName)}`]: [classNode.name.text],
    }

    if (useMasterServiceStub) {
      this.buildMasterServiceImportsObj();
    } else {
      this.buildNonMasterServiceImportsObj();
    }
  }

  private addImport(path: string, name: string): void {
    if (!this.importsObj.hasOwnProperty(path)) {
      this.importsObj[path] = [name];
    } else {
      this.importsObj[path].push(name);
    }
  }

  private buildMasterServiceImportsObj() {
    const stubName: string = 'MasterServiceStub';
    const stubPath: string = findRelativeStubPath(stubName);
    if (stubPath) {
      this.addImport(stubPath, stubName);
    }
    this.constructorParams.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      this.addImport(findProviderPath(this.sourceFile, provider), provider)
    });
  }

  private buildNonMasterServiceImportsObj() {
    this.constructorParams.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName: string = provider + 'Stub';
      this.addImport(findProviderPath(this.sourceFile, provider), provider)
      const stubPath: string = findRelativeStubPath(stubName);
      if (stubPath) {
        this.addImport(stubPath, stubName);
      }
    });
  }

  public getImportsTemplate(): ImportDeclaration[] {
    const result = [];
    for (const path in this.importsObj) {
      result.push(
        ts.createImportDeclaration(undefined, undefined, ts.createImportClause(
          <any>ts.createObjectLiteral(<any>this.importsObj[path].map((x: string) => ts.createIdentifier(x))), undefined), ts.createLiteral(path))
      );
    }
    return result;
  }
}

export default ImportsBuilder;