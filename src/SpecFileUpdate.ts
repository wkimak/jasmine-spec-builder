import ts, { SourceFile, PropertyAssignment } from "typescript";
import { isComponentFile } from "./shared/regex";
import ComponentConfiguration from "./Configuration/ComponentConfiguration";
import ServiceConfiguration from "./Configuration/ServiceConfiguration";
import SpecFileBuilder from "./SpecFileBuilder";
import Configuration from "./Configuration/Configuration";
import getDependancyObj from "./dependencies/dependencies";
import getImportsTemplate from "./imports/imports";

class SpecFileUpdate extends SpecFileBuilder {
  dependencyObj;
  currentProviders;
  targetFile;

  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    super(sourceFile, useMasterServiceStub);
  }

  private removeImportDeclarations(ctx: ts.TransformationContext) {
    const callback = (node) => {
      if (ts.isImportDeclaration(node) && this.dependencyObj.hasOwnProperty((<any>node.moduleSpecifier).text)) {
        return null;
      }
    }
    return (rootNode: ts.SourceFile) => ts.visitNode(rootNode, this.visit(ctx, callback))
  }

  private removeImportDeclarationsByName(ctx: ts.TransformationContext) {
    const callback = (node) => {
      if (ts.isImportDeclaration(node)) {
        let isProviderImport = false;
        if (<any>node.importClause.namedBindings) {
          (<any>node.importClause.namedBindings).elements.forEach(i => {
            if (this.currentProviders.hasOwnProperty(i.name.escapedText)) {
              isProviderImport = true;
            }
          })
        } else {
          if (this.currentProviders.hasOwnProperty(node.importClause.name.text)) {
            return null;
          }
        }

        if (isProviderImport) {
          return null;
        }
      }
    }
    return (rootNode: ts.SourceFile) => ts.visitNode(rootNode, this.visit(ctx, callback))
  }

  public findProviders(node): any {
    if (ts.isPropertyAssignment(node) && (<any>node.name).text === 'providers') {
      const names = { MasterServiceStub: true };
      (<any>node.initializer).elements.forEach(child => {
        if (child.hasOwnProperty('properties')) {
          child.properties.forEach(prop => {
            names[prop.initializer.text] = true;
          });
        } else {
          names[child.escapedText] = true;
        }

      })
      return names;
    }

    return ts.forEachChild(node, this.findProviders.bind(this));
  }


  private updateProviders(ctx: ts.TransformationContext) {
    const callback = (node) => {
      if (ts.isPropertyAssignment(node) && (<any>node.name).text === 'providers') {
        const providers: PropertyAssignment = isComponentFile.test(this.sourceFile.fileName) ?
          new ComponentConfiguration(this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders() :
          new ServiceConfiguration(this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders();
        return providers;
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

      console.log('NODE', node)
      if (ts.isExpressionStatement(node) && (<any>node.getFirstToken(this.targetFile)).escapedText === 'TestBed') {
        const updatedProviders = ts.transform(node, [this.updateProviders.bind(this)]).transformed[0];
        return new Configuration(this.classNode, this.constructorParams, this.useMasterServiceStub).getStatements(updatedProviders);
      }
    }
    return (rootNode: ts.SourceFile) => ts.visitNode(rootNode, this.visit(ctx, callback))
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

  public update(targetFile: SourceFile): SourceFile {
    this.targetFile = targetFile;
    this.dependencyObj = getDependancyObj(this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub);
    this.currentProviders = this.findProviders(targetFile);
    const rootNode = ts.transform(
      targetFile,
      [
        this.removeImportDeclarations.bind(this),
        this.removeImportDeclarationsByName.bind(this),
        this.updateTestBed.bind(this)
      ]
    ).transformed[0];

    rootNode.statements = ts.createNodeArray([...getImportsTemplate(this.dependencyObj), ...rootNode.statements]);
    return rootNode;
  }
}

export default SpecFileUpdate;