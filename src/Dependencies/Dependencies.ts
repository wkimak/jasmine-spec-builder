import getProviderDependencies from './providerDependencies';
import getStubPathAndExport, { findRootDirectory } from './stubDependencies';
import { DependencyObj } from './DependencyObj.model';
import { getStubFileName, getStubName } from '../shared/helpers';
import ts, { ClassDeclaration, SourceFile, ParameterDeclaration } from 'typescript';

let dependencyObj: DependencyObj;

function addDependency(obj: DependencyObj): void {
  dependencyObj = { ...dependencyObj, ...obj };
}

function getDependency(fileName: string, stubName: string): void {
  const currentDirectory: string = process.cwd();
  const projectRootDirectory = findRootDirectory(currentDirectory);
  const obj: DependencyObj = getStubPathAndExport(fileName, stubName, currentDirectory, projectRootDirectory);
  if (obj) {
    addDependency(obj);
  }
};

function getDependancyObj(sourceFile: SourceFile, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean): DependencyObj {
  dependencyObj = {
    '@angular/core/testing': { TestBed: 'TestBed', async: 'async' }
  }

  let provider: string;
  if (useMasterServiceStub) {
    provider = 'MasterService';
    getDependency(getStubFileName(provider), getStubName(provider));
  } else {
    constructorParams.forEach((param: any) => {
      provider = param.type.typeName.text;
      getDependency(getStubFileName(provider), getStubName(provider));
    });
  }

  getDependency(sourceFile.fileName, classNode.name.text);
  addDependency(getProviderDependencies(constructorParams, sourceFile));
  return dependencyObj;
}

export default getDependancyObj;