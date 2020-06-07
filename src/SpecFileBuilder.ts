import ts, { SourceFile, ClassDeclaration, ParameterDeclaration } from "typescript";

class SpecFileBuilder {
  sourceFile: SourceFile;
  targetFile: SourceFile;
  useMasterServiceStub: boolean;
  classNode: ClassDeclaration;
  constructorParams: ts.NodeArray<ParameterDeclaration>;

  constructor(sourceFile: SourceFile, targetFile: SourceFile, useMasterServiceStub: boolean) {
    this.sourceFile = sourceFile;
    this.targetFile = targetFile;
    this.useMasterServiceStub = useMasterServiceStub;
    this.classNode = this.findClassNode(sourceFile);
    this.constructorParams = this.findConstructorParams(this.classNode) || ts.createNodeArray();
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