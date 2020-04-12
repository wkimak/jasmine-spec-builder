import ts, { PropertyAssignment, Identifier, ExpressionStatement, CallExpression, ObjectLiteralExpression } from "typescript";
import { Stub } from "../shared/interfaces/Stub";
import { getProviderStubs } from "../shared/templates/configuration";

function getProviders(stubs: Stub[], name: string): PropertyAssignment {
  const providers: Identifier = ts.createIdentifier('providers');
  const className: Identifier = ts.createIdentifier(name);
  const providersArray: ObjectLiteralExpression[] = getProviderStubs(stubs);
  return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
    [className, ...providersArray]
  ));
}

function getTestingModule(providers: PropertyAssignment): CallExpression {
  const configureTestingModule: Identifier = ts.createIdentifier('configureTestingModule');
  return ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
    [providers], true
  )])
}

function getTestBed(testingModule: CallExpression): ExpressionStatement {
  const testBed: Identifier = ts.createIdentifier('TestBed');
  return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>testingModule));
}

export function getServiceConfig(stubs: Stub[], name: string): ExpressionStatement {
  const providers = getProviders(stubs, name);
  const testingModule = getTestingModule(providers);
  return getTestBed(testingModule);
}
