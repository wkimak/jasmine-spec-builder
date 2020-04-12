import ts, { PropertyAssignment, Identifier, ExpressionStatement, CallExpression, ObjectLiteralExpression } from "typescript";
import { Stub } from "../shared/interfaces/Stub";
import { getProviderStubs } from "../shared/templates/configuration";

function getDeclarations(name: string): PropertyAssignment {
  const declarations: Identifier = ts.createIdentifier('declarations');
  const className: Identifier = ts.createIdentifier(name);
  return ts.createPropertyAssignment(declarations, ts.createArrayLiteral([className]));
}

function getProviders(stubs: Stub[]): PropertyAssignment {
  const providers: Identifier = ts.createIdentifier('providers');
  const providersArray: ObjectLiteralExpression[] = getProviderStubs(stubs);
  return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
    providersArray
  ));
}

function getTestingModule(declarations: PropertyAssignment, providers: PropertyAssignment): CallExpression {
  const configureTestingModule: Identifier = ts.createIdentifier('configureTestingModule');
  return ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
    [declarations, providers], true
  )])
}

function getTestBed(testingModule: CallExpression): ExpressionStatement {
  const testBed: Identifier = ts.createIdentifier('TestBed');
  const compileComponents: Identifier = ts.createIdentifier('compileComponents');
  return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>ts.createPropertyAccess(testingModule, <any>ts.createCall(compileComponents, undefined, undefined))));
}


export function getComponentConfig(stubs: Stub[], name: string): ExpressionStatement {
  const declarations = getDeclarations(name);
  const providers = getProviders(stubs);
  const testingModule = getTestingModule(declarations, providers);
  return getTestBed(testingModule);
}

