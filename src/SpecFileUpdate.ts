import ts, { SourceFile } from "typescript";
import Dependencies from "./Dependencies/Dependencies";
import { findClassNode, findConstructorParams } from "./shared/helpers";
import { isComponentFile } from "./shared/regex";
import ComponentConfiguration from "./Configuration/ComponentConfiguration";
import ServiceConfiguration from "./Configuration/ServiceConfiguration";

export default class SpecFileUpdate {
  providers;

  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    const classNode = findClassNode(sourceFile);
    const constructorParams = findConstructorParams(classNode);
    const dependancyObj = new Dependencies(sourceFile, classNode, constructorParams, useMasterServiceStub).getDependancyObj();
    this.providers = isComponentFile.test(sourceFile.fileName) ?
      new ComponentConfiguration(dependancyObj, classNode, constructorParams, useMasterServiceStub).getProviders() :
      new ServiceConfiguration(dependancyObj, classNode, constructorParams, useMasterServiceStub).getProviders();
  }

  updateProviders(context: any) {
    return (rootNode) => {
      const visit = (node) => {
        if (ts.isPropertyAssignment(node) && (<any>node.name).text === 'providers') {
          return this.providers;
        }
        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(rootNode, visit);
    }
  }

  public update(targetFile: SourceFile) {
    return ts.transform(
      targetFile, [this.updateProviders.bind(this)]
    ).transformed[0];
  }
} 