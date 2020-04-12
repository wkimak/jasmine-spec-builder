import ts, { Identifier, ExpressionStatement, PropertyAssignment, ObjectLiteralExpression, CallExpression } from "typescript";
import { Stub } from '../interfaces/Stub';
import getArrowFn from './arrowFunction';

export function getProviderStubs(stubs: Stub[]): ObjectLiteralExpression[] {
  const provide: Identifier = ts.createIdentifier('provide');
  const useClass: Identifier = ts.createIdentifier('useClass');
  return stubs.map(stub => {
    return ts.createObjectLiteral([ts.createPropertyAssignment(provide, ts.createIdentifier(stub.provider)),
    ts.createPropertyAssignment(useClass, ts.createIdentifier(stub.class))])
  });
}

export function getConfiguration(testBed: ExpressionStatement, useMasterServiceStub: boolean): ExpressionStatement {
  const beforeEach: Identifier = ts.createIdentifier("beforeEach");
  const async: Identifier = ts.createIdentifier('async');
  const masterServiceStub: Identifier = ts.createIdentifier('masterServiceStub');
  const MasterServiceStub: Identifier = ts.createIdentifier('MasterServiceStub');

  const master: ExpressionStatement = ts.createExpressionStatement(ts.createBinary(masterServiceStub, ts.createToken(ts.SyntaxKind.EqualsToken), ts.createNew(MasterServiceStub, undefined, undefined)));
  const statements: ExpressionStatement[] = useMasterServiceStub ? [master, testBed] : [testBed];
  return ts.createExpressionStatement(ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [getArrowFn(statements)])]));
}