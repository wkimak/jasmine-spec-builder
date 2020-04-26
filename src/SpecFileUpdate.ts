import ts, { SourceFile, Visitor } from "typescript";
import { isComponentFile } from "./shared/regex";
import ComponentConfiguration from "./Configuration/ComponentConfiguration";
import ServiceConfiguration from "./Configuration/ServiceConfiguration";
import SpecFileBuilder from "./SpecFileBuilder";

class SpecFileUpdate extends SpecFileBuilder {

  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    super(sourceFile, useMasterServiceStub);
  }

  removeImportSpecifiers(context) {
    return (rootNode) => {
      const visit = (node) => {
        if (ts.isImportSpecifier(node) && this.dependencyObj.names[node.name.text]) {
          return null;
        }
        
        return ts.visitEachChild(node, visit, context);
      };
      return ts.visitNode(rootNode, visit);
    }
  }

  removeImportDeclarations(context) {
    return (rootNode) => {
      const visit = (node) => {
        if (ts.isImportDeclaration(node) && !(<any>node.importClause.namedBindings).elements.length) {
          return null;
        }
        return ts.visitEachChild(node, visit, context);
      };
      return ts.visitNode(rootNode, visit);
    }
  }

  updateProviders(context: any) {
    return (rootNode) => {
      const visit = (node) => {
        if (ts.isPropertyAssignment(node) && (<any>node.name).text === 'providers') {
          const providers = isComponentFile.test(this.sourceFile.fileName) ?
            new ComponentConfiguration(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders() :
            new ServiceConfiguration(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders();
          return providers;
        }
        return ts.visitEachChild(node, visit, context);
      };

      return ts.visitNode(rootNode, visit);
    }
  }

  public update(targetFile: SourceFile): SourceFile {
    const rootNode = ts.transform(
      targetFile,
      [
        this.removeImportSpecifiers.bind(this),
        this.removeImportDeclarations.bind(this),
        this.updateProviders.bind(this)
      ]
    ).transformed[0];
    rootNode.statements = ts.createNodeArray([...this.imports, ...rootNode.statements]);
    return rootNode;
  }
}

export default SpecFileUpdate;