import ts, { ClassDeclaration, SourceFile, FunctionDeclaration, ExpressionStatement, VariableStatement } from "typescript";
import getArrowFn from '../shared/arrowFunction';

class DescribesBuilder {
  sourceFile: SourceFile | ClassDeclaration;
  configuration: (VariableStatement | ExpressionStatement)[];
  constructor(sourceFile: SourceFile, configuration: (VariableStatement | ExpressionStatement)[]) {
    this.sourceFile = sourceFile;
    this.configuration = configuration;
  }

  private getDescribe(name: string): ExpressionStatement {
    return ts.createExpressionStatement(ts.createCall(ts.createIdentifier('describe'), undefined, [ts.createStringLiteral(name), getArrowFn()]));
  }

  public getDescribesTemplate(sourceFile?: ClassDeclaration, describeBody?): ExpressionStatement[];
  public getDescribesTemplate(sourceFile?: SourceFile, describeBody?): ExpressionStatement[];
  public getDescribesTemplate(sourceFile = this.sourceFile, describeBody = { statements: [] }) {
    ts.forEachChild(sourceFile, childNode => {
      if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
        const node = <ClassDeclaration | FunctionDeclaration>childNode;
        describeBody.statements = [...describeBody.statements, this.getDescribe(node.name.text)];
      }

      if (ts.isClassDeclaration(childNode)) {
        const body = describeBody.statements[0].expression.arguments[1].body;
        body.statements = this.configuration;
        this.getDescribesTemplate(childNode, body);
      }
    });
    return describeBody.statements;
  }
}

export default DescribesBuilder;