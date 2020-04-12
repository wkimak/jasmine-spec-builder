import ts, { ExpressionStatement } from "typescript";
import getArrowFn from "./arrowFunction";

export default function getDescribe(name: string): ExpressionStatement {
  return ts.createExpressionStatement(ts.createCall(ts.createIdentifier('describe'), undefined, [ts.createStringLiteral(name), getArrowFn()]));
}