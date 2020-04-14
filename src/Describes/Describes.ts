import ts, { ClassDeclaration, SourceFile, FunctionDeclaration, ExpressionStatement } from "typescript";
import getArrowFn from '../shared/arrowFunction';

class DescribesBuilder {
  sourceFile: SourceFile | ClassDeclaration;
  constructor(sourceFile: SourceFile) {
    this.sourceFile = sourceFile;
  }

  private getDescribe(name: string): ExpressionStatement {
    return ts.createExpressionStatement(ts.createCall(ts.createIdentifier('describe'), undefined, [ts.createStringLiteral(name), getArrowFn()]));
  }

  public getDescribesTemplate(sourceFile?: ClassDeclaration, describeBody?);
  public getDescribesTemplate(sourceFile?: SourceFile, describeBody?);
  public getDescribesTemplate(sourceFile = this.sourceFile, describeBody = { statements: [] }) {
    ts.forEachChild(sourceFile, childNode => {
      if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
        const node = <ClassDeclaration | FunctionDeclaration>childNode;
        describeBody.statements = [...describeBody.statements, this.getDescribe(node.name.text)];
      }

      if (ts.isClassDeclaration(childNode)) {
        this.getDescribesTemplate(childNode, describeBody.statements[0].expression.arguments[1].body);
      }
    });
    return describeBody.statements;
  }
}

export default DescribesBuilder;