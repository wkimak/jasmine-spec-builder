import ts, { ClassDeclaration, SourceFile, FunctionDeclaration, ExpressionStatement } from "typescript";
import getArrowFn from '../shared/arrowFunction';
import { describe } from '../shared/identifiers';

function getDescribe(name: string): ExpressionStatement {
  return ts.createExpressionStatement(ts.createCall(describe, undefined, [ts.createStringLiteral(name), getArrowFn()]));
}

function getDescribesTemplate(sourceFile: ClassDeclaration, configuration, describeBody?): ExpressionStatement[];
function getDescribesTemplate(sourceFile: SourceFile, configuration, describeBody?): ExpressionStatement[];
function getDescribesTemplate(sourceFile, configuration, describeBody = { statements: [] }) {
  ts.forEachChild(sourceFile, childNode => {
    if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
      const node = <ClassDeclaration | FunctionDeclaration>childNode;
      describeBody.statements = [...describeBody.statements, getDescribe(node.name.text)];
    }

    if (ts.isClassDeclaration(childNode)) {
      const body = describeBody.statements[0].expression.arguments[1].body;
      body.statements = ts.createNodeArray([configuration]);
      getDescribesTemplate(childNode, configuration, body);
    }
  });
  return describeBody.statements;
}

export default getDescribesTemplate;