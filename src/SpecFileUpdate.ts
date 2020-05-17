import ts, { SourceFile, PropertyAssignment } from "typescript";
import { isComponentFile } from "./shared/regex";
import ComponentConfiguration from "./Configuration/ComponentConfiguration";
import ServiceConfiguration from "./Configuration/ServiceConfiguration";
import SpecFileBuilder from "./SpecFileBuilder";
import Configuration from "./Configuration/Configuration";
import getDependancyObj from "./dependencies/dependencies";
import getImportsTemplate from "./imports/imports";
import DependencyObj from "./dependencies/DependencyObj.model";

class SpecFileUpdate extends SpecFileBuilder {
  dependencyObj: DependencyObj;
  recentProviderImportNames: { [name: string]: boolean } = { MasterServiceStub: true };

  constructor(sourceFile: SourceFile, targetFile: SourceFile, useMasterServiceStub: boolean) {
    super(sourceFile, targetFile, useMasterServiceStub);
  }

  private isProvidersArray(node: any): boolean {
    return ts.isPropertyAssignment(node) && (<any>node.name).text === 'providers';
  }

  private visit(ctx: ts.TransformationContext, callback: Function) {
    const visitor: ts.Visitor = (node: ts.Node) => {
      const result = callback(node);
      if (result !== undefined) {
        return result;
      }
      return ts.visitEachChild(node, visitor, ctx);
    };
    return visitor;
  }

  private setRecentProviderImportNames(node: any) {
    if (this.isProvidersArray(node)) {
      (<any>node.initializer).elements.forEach(child => {
        if (child.hasOwnProperty('properties')) {
          child.properties.forEach(prop => {
            this.recentProviderImportNames[prop.initializer.text] = true;
          });
        } else {
          this.recentProviderImportNames[child.escapedText] = true;
        }

      })
    }

    return ts.forEachChild(node, this.setRecentProviderImportNames.bind(this));
  }

  private removeImportDeclarations(ctx: ts.TransformationContext) {
    const callback = (node) => {
      if (ts.isImportDeclaration(node)) {
        if (<any>node.importClause.namedBindings) {
          for (const binding of (<any>node.importClause.namedBindings).elements) {
            if (this.recentProviderImportNames.hasOwnProperty(binding.name.escapedText)) {
              return null;
            }
          }
        } else if (this.recentProviderImportNames.hasOwnProperty(node.importClause.name.text)) {
          return null;
        }

        if (this.dependencyObj.hasOwnProperty((<any>node.moduleSpecifier).text)) {
          return null;
        }
      }
    }
    return (rootNode: ts.SourceFile) => ts.visitNode(rootNode, this.visit(ctx, callback))
  }

  private updateProviders(ctx: ts.TransformationContext) {
    const callback = (node) => {
      if (this.isProvidersArray(node)) {
        return isComponentFile.test(this.sourceFile.fileName) ?
          new ComponentConfiguration(this.classNode, this.constructorParams, this.useMasterServiceStub).getProvidersTemplate() :
          new ServiceConfiguration(this.classNode, this.constructorParams, this.useMasterServiceStub).getProvidersTemplate();
      }
    }
    return (rootNode: ts.SourceFile) => ts.visitNode(rootNode, this.visit(ctx, callback))
  }

  private updateTestBed(ctx: ts.TransformationContext) {
    const callback = (node) => {
      if (ts.isVariableStatement(node)) {
        if ((<any>node.declarationList.declarations[0].name).escapedText === 'masterServiceStub') {
          return null;
        }
      }

      if (ts.isExpressionStatement(node) && (<any>node.getFirstToken(this.targetFile)).escapedText === 'TestBed') {
        const updatedProviders = ts.transform(node, [this.updateProviders.bind(this)]).transformed[0];
        return new Configuration(this.classNode, this.constructorParams, this.useMasterServiceStub).getTestBedStatements(updatedProviders);
      }
    }
    return (rootNode: ts.SourceFile) => ts.visitNode(rootNode, this.visit(ctx, callback))
  }

  public update(): SourceFile {
    this.dependencyObj = getDependancyObj(this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub);
    this.setRecentProviderImportNames(this.targetFile);
    const rootNode = ts.transform(
      this.targetFile,
      [
        this.removeImportDeclarations.bind(this),
        this.updateTestBed.bind(this)
      ]
    ).transformed[0];

    rootNode.statements = ts.createNodeArray([...getImportsTemplate(this.dependencyObj), ...rootNode.statements]);
    return rootNode;
  }
}

export default SpecFileUpdate;