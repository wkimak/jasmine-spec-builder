import ts, { ExpressionStatement } from "typescript";
import { beforeEach } from '../shared/identifiers.js';

function getBeforeEachTemplate(args: any): ExpressionStatement {
  return ts.createExpressionStatement(ts.createCall(beforeEach, undefined, args));
}

export default getBeforeEachTemplate;