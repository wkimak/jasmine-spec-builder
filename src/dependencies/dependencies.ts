import getProviderDependencies from './providerDependencies';
import getStubPathAndExport, { findRootDirectory } from './stubDependencies';
import { DependencyObj, PathForImport, DependencyNameForProviders } from './DependencyObj.model';
import { getStubFileName, getStubName } from '../shared/helpers';
import ts, { ClassDeclaration, SourceFile, ParameterDeclaration, Identifier } from 'typescript';

let dependencyObj: DependencyObj = {
  pathsForImports: {},
  dependencyNamesForProviders: {}
};

function addDependencyPathForImports(obj: PathForImport): void {
  dependencyObj.pathsForImports = { ...dependencyObj.pathsForImports, ...obj };
}

function addDependencyForProviders(obj: DependencyNameForProviders): void {
  dependencyObj.dependencyNamesForProviders = { ...dependencyObj.dependencyNamesForProviders, ...obj }
}

function getDependency(fileName: string, stubName: string, addToImports: boolean): void {
  const currentDirectory: string = process.cwd();
  const projectRootDirectory = findRootDirectory(currentDirectory);
  const obj: PathForImport = getStubPathAndExport(fileName, stubName, currentDirectory, projectRootDirectory);
  if (obj) {
    if (addToImports) {
      addDependencyPathForImports(obj);
    }

    addDependencyForProviders({ [stubName]: true });
  }
};

function setTestingPathDependencies(isComponent: boolean) {
  const path = '@angular/core/testing';
  dependencyObj.pathsForImports[path] = { TestBed: 'TestBed', async: 'async' };

  if (isComponent) {
    dependencyObj.pathsForImports[path] = { ...dependencyObj.pathsForImports[path], ComponentFixture: 'ComponentFixture' }
  }
}

function getDependancyObj(isComponent: boolean, sourceFile: SourceFile, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean): DependencyObj {

  setTestingPathDependencies(isComponent);

  let provider: string;
  if (useMasterServiceStub) {
    provider = 'MasterService';
    getDependency(getStubFileName(provider), getStubName(provider), true);
  }

  constructorParams.forEach((param: any) => {
    const typeName: Identifier = param.type.typeName;
    if (typeName) {
      const provider: string = typeName.text;
      getDependency(getStubFileName(provider), getStubName(provider), !useMasterServiceStub);
    }
  });

  getDependency(sourceFile.fileName, classNode.name.text, true);
  addDependencyPathForImports(getProviderDependencies(constructorParams, sourceFile));

  return dependencyObj;
}

export default getDependancyObj;