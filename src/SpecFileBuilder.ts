import ts, { SourceFile, ClassDeclaration, ParameterDeclaration, ImportDeclaration } from "typescript";
import Dependencies from "./Dependencies/Dependencies";
import ImportsBuilder from "./Imports/Imports";
import DependencyObj from "./Dependencies/DependencyObj.model";

class SpecFileBuilder {
  sourceFile: SourceFile;
  useMasterServiceStub: boolean;
  classNode: ClassDeclaration;
  constructorParams: ts.NodeArray<ParameterDeclaration>;
  dependencyObj: DependencyObj;
  imports: ImportDeclaration[];

  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    this.sourceFile = sourceFile;
    this.useMasterServiceStub = useMasterServiceStub;
    this.classNode = this.findClassNode(sourceFile);
    this.constructorParams = this.findConstructorParams(this.classNode);
    this.dependencyObj = new Dependencies(this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub).getDependancyObj();
    this.imports = new ImportsBuilder().getImportsTemplate(this.dependencyObj);
  }

  private findClassNode(sourceFile: SourceFile): ClassDeclaration {
    for (const childNode of sourceFile.statements) {
      if (ts.isClassDeclaration(childNode)) {
        return childNode;
      }
    }
  }

  private findConstructorParams(classNode: ClassDeclaration): ts.NodeArray<ParameterDeclaration> {
    for (const member of classNode.members) {
      if (ts.isConstructorDeclaration(member)) {
        return member.parameters;
      }
    }
  };
}


export default SpecFileBuilder;