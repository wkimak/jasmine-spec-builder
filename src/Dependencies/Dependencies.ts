import { getProviderDependencies } from './providerDependencies';
import { getDependencyPathAndExports } from './dependencyHelpers';
import DependencyObj from './DependencyObj.model';
import { getStubFileName, getStubName } from '../shared/helpers';
import { ClassDeclaration, SourceFile } from 'typescript';

let dependencyObj: DependencyObj;

function addDependency(obj) {
  dependencyObj = { ...dependencyObj, ...obj };
}

function getDependency(fileName: string, name: string) {
  const obj = getDependencyPathAndExports(fileName, name);
  if (obj) {
    addDependency(obj);
  }
};

export default function getDependancyObj(sourceFile: SourceFile, classNode: ClassDeclaration, constructorParams, useMasterServiceStub: boolean): DependencyObj {
  dependencyObj = {
    '@angular/core/testing': { TestBed: 'Testbed', async: 'async' }
  }

  if (useMasterServiceStub) {
    const provider = 'MasterService';
    getDependency(getStubFileName(provider), getStubName(provider));
  } else {
    constructorParams.forEach(param => {
      const provider: string = param.type.typeName.text;
      getDependency(getStubFileName(provider), getStubName(provider));
    });
  }

  getDependency(sourceFile.fileName, classNode.name.text);
  addDependency(getProviderDependencies(constructorParams, sourceFile));
  return dependencyObj;
}