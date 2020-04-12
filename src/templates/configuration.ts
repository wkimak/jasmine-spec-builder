import ts, { Identifier, ExpressionStatement, PropertyAssignment, ObjectLiteralExpression, CallExpression } from "typescript";
import { Stub } from '../interfaces/Stub';
import { getArrowFn } from '../templates';

const useClass: Identifier = ts.createIdentifier('useClass'),
  provide: Identifier = ts.createIdentifier('provide'),
  providers: Identifier = ts.createIdentifier('providers'),
  declarations: Identifier = ts.createIdentifier('declarations'),
  beforeEach: Identifier = ts.createIdentifier("beforeEach"),
  async: Identifier = ts.createIdentifier('async'),
  testBed: Identifier = ts.createIdentifier('TestBed'),
  configureTestingModule: Identifier = ts.createIdentifier('configureTestingModule'),
  compileComponents: Identifier = ts.createIdentifier('compileComponents'),
  masterServiceStub: Identifier = ts.createIdentifier('masterServiceStub'),
  MasterServiceStub: Identifier = ts.createIdentifier('MasterServiceStub');


function getProviderStubs(stubs: Stub[]): ObjectLiteralExpression[] {
  return stubs.map(stub => {
    return ts.createObjectLiteral([ts.createPropertyAssignment(provide, ts.createIdentifier(stub.provider)),
    ts.createPropertyAssignment(useClass, ts.createIdentifier(stub.class))])
  });
}

export function getComponentDeclarations(name: string): PropertyAssignment {
  const className: Identifier = ts.createIdentifier(name);
  return ts.createPropertyAssignment(declarations, ts.createArrayLiteral([className]));
}

export function getComponentProviders(stubs: Stub[]): PropertyAssignment {
  const providersArray = getProviderStubs(stubs);
  return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
    providersArray
  ));
}

export function getServiceDeclarations(): PropertyAssignment {
  return ts.createPropertyAssignment(declarations, ts.createArrayLiteral());
}

export function getServiceProviders(stubs: Stub[], name: string): PropertyAssignment {
  const className: Identifier = ts.createIdentifier(name),
    providersArray = getProviderStubs(stubs);
  return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
    [className, ...providersArray]
  ));
}

export function getConfiguration(declarations: PropertyAssignment, providers: PropertyAssignment, useMasterServiceStub: boolean): ExpressionStatement {
  const configure: CallExpression = ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
    [declarations, providers], true
  )])

  const master: ExpressionStatement = ts.createExpressionStatement(ts.createBinary(masterServiceStub, ts.createToken(ts.SyntaxKind.EqualsToken), ts.createNew(MasterServiceStub, undefined, undefined)));
  const setup: ExpressionStatement = ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>ts.createPropertyAccess(configure, <any>ts.createCall(compileComponents, undefined, undefined))));

  const statements: ExpressionStatement[] = useMasterServiceStub ? [master, setup] : [setup];

  return ts.createExpressionStatement(ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [getArrowFn(statements)])]));
}