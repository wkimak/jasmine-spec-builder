import getProviderDependencies from './providerDependencies';
import getStubPathAndExport, { findRootDirectory } from './stubDependencies';
import { DependencyObj } from './DependencyObj.model';
import { getStubFileName, getStubName } from '../shared/helpers';
import ts, { ClassDeclaration, SourceFile, ParameterDeclaration, Identifier } from 'typescript';

let dependencyObj: DependencyObj = {};

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

function setTestingPathDependencies(isComponent: boolean) {
  const path = '@angular/core/testing';
  dependencyObj[path] = { TestBed: 'TestBed', async: 'async' };

  if (isComponent) {
    dependencyObj[path] = { ...dependencyObj[path], ComponentFixture: 'ComponentFixture' }
  }
}

function getDependancyObj(isComponent: boolean, sourceFile: SourceFile, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean): DependencyObj {

  setTestingPathDependencies(isComponent);

  let provider: string;
  if (useMasterServiceStub) {
    provider = 'MasterService';
    getDependency(getStubFileName(provider), getStubName(provider));
  } else {
    constructorParams.forEach((param: any) => {
      const typeName: Identifier = param.type.typeName;

      if (typeName) {
        const provider: string = typeName.text;
        getDependency(getStubFileName(provider), getStubName(provider));
      }
    });
  }

  getDependency(sourceFile.fileName, classNode.name.text);
  addDependency(getProviderDependencies(constructorParams, sourceFile));
  return dependencyObj;
}

export default getDependancyObj;