import ts, { SourceFile, ClassDeclaration, ParameterDeclaration, PropertyAssignment } from "typescript";
import DependencyObj from "./Dependencies/DependencyObj.model";
import Dependencies from "./Dependencies/Dependencies";
import { findClassNode, findConstructorParams } from "./shared/helpers";
import { isComponentFile } from "./shared/regex";
import ComponentConfiguration from "./Configuration/ComponentConfiguration";
import ServiceConfiguration from "./Configuration/ServiceConfiguration";

export default class SpecFileUpdate {
  providers: PropertyAssignment;
  constructor(sourceFile: SourceFile, targetFile: SourceFile, useMasterServiceStub: boolean) {
    const classNode: ClassDeclaration = findClassNode(sourceFile);
    const constructorParams: ts.NodeArray<ParameterDeclaration> = findConstructorParams(classNode);
    const dependancyObj: DependencyObj = new Dependencies(sourceFile, classNode, constructorParams, useMasterServiceStub).getDependancyObj();
    this.providers = isComponentFile.test(sourceFile.fileName) ?
      new ComponentConfiguration(dependancyObj, classNode, constructorParams, useMasterServiceStub).getProviders() :
      new ServiceConfiguration(dependancyObj, classNode, constructorParams, useMasterServiceStub).getProviders();
  }

  public update() { }
} 