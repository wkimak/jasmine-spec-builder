import ts, { SourceFile, ClassDeclaration, ParameterDeclaration } from 'typescript';
import { findRelativeStubPath, findProviderPath, removePathExtension } from './pathHelpers';
import DependencyObj from './DependencyObj.model';
import { getStubName } from '../shared/helpers';

export default class Dependencies {
  sourceFile: SourceFile;
  useMasterServiceStub: boolean;
  constructorParams: ts.NodeArray<ParameterDeclaration>;
  dependencyObj: DependencyObj;

  constructor(sourceFile: SourceFile, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    this.sourceFile = sourceFile;
    this.useMasterServiceStub = useMasterServiceStub;
    this.constructorParams = constructorParams;
    this.dependencyObj = {
      paths: {
        '@angular/core/testing': ['TestBed', 'async'],
        [`./${removePathExtension(sourceFile.fileName)}`]: [classNode.name.text]
      },
      names: {
        TestBed: true,
        async: true,
        [classNode.name.text]: true
      }
    }
  }

  private addDependency(name: string, path?: string): void {
    if (path) {
      if (!this.dependencyObj.paths.hasOwnProperty(path)) {
        this.dependencyObj.paths[path] = [name];
      } else {
        this.dependencyObj.paths[path].push(name);
      }
    }
    this.dependencyObj.names[name] = true;
  }

  private buildMasterServiceDependancyObj(): void {
    const masterStubName: string = 'MasterServiceStub';
    let stubPath: string = findRelativeStubPath(masterStubName);
    if (stubPath) {
      this.addDependency(masterStubName, stubPath);
    }
    this.constructorParams.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName: string = getStubName(provider);
      this.addDependency(provider, findProviderPath(this.sourceFile, provider));
      if (findRelativeStubPath(stubName)) {
        this.addDependency(stubName);
      }
    });
  }

  private buildNonMasterServiceDependancyObj(): void {
    this.constructorParams.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName: string = getStubName(provider);
      this.addDependency(provider, findProviderPath(this.sourceFile, provider));
      const stubPath: string = findRelativeStubPath(stubName);
      if (stubPath) {
        this.addDependency(stubName, stubPath);
      }
    });
  }

  public getDependancyObj(): DependencyObj {
    if (this.useMasterServiceStub) {
      this.buildMasterServiceDependancyObj();
    } else {
      this.buildNonMasterServiceDependancyObj();
    }
    return this.dependencyObj;
  }
}