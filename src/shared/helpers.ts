import ts, { SourceFile, ClassDeclaration, ParameterDeclaration } from "typescript";

export function getStubName(provider: string): string {
  return provider + 'Stub';
}

export function findClassNode(sourceFile: SourceFile): ClassDeclaration {
  for (const childNode of sourceFile.statements) {
    if (ts.isClassDeclaration(childNode)) {
      return childNode;
    }
  }
}

export function findConstructorParams(classNode: ClassDeclaration): ts.NodeArray<ParameterDeclaration> {
  for (const member of classNode.members) {
    if (ts.isConstructorDeclaration(member)) {
      return member.parameters;
    }
  }
};