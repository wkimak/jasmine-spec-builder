import ts, { ExpressionStatement, ImportDeclaration, ArrowFunction, Statement, CallExpression, Identifier, PropertyAssignment, ObjectLiteralExpression, VariableStatement } from 'typescript';
import { Stub } from './interfaces/Stub';

function createArrowFn(statements: Statement[] = []): ArrowFunction {
    return ts.createArrowFunction(
        undefined,
        undefined,
        [
            ts.createParameter(undefined, undefined, undefined, <any>ts.createToken(null), undefined, undefined, undefined)
        ],
        undefined,
        ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.createBlock(statements, true)
    );
}

export function getDescribe(name: string): ExpressionStatement {
    return ts.createExpressionStatement(ts.createCall(ts.createIdentifier('describe'), undefined, [ts.createStringLiteral(name), createArrowFn()]));
}

export function getImport(importNames: string[], path: string): ImportDeclaration {
    const properties = [];
    importNames.forEach(name => properties.push(ts.createIdentifier(name)));
    return ts.createImportDeclaration(undefined, undefined, ts.createImportClause(
        <any>ts.createObjectLiteral(properties), undefined), ts.createLiteral(path));
}

export function getMasterServiceInit(): VariableStatement {
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(ts.createIdentifier('masterServiceStub'), ts.createTypeReferenceNode(ts.createIdentifier('MasterServiceStub'), undefined))]));
}

export function getConfiguration(stubs: Stub[], name: string, useMasterServiceStub: boolean): ExpressionStatement {
    const beforeEach: Identifier = ts.createIdentifier("beforeEach"),
        async: Identifier = ts.createIdentifier('async'),
        testBed: Identifier = ts.createIdentifier('TestBed'),
        configureTestingModule: Identifier = ts.createIdentifier('configureTestingModule'),
        declarations: Identifier = ts.createIdentifier('declarations'),
        providers: Identifier = ts.createIdentifier('providers'),
        provide: Identifier = ts.createIdentifier('provide'),
        useClass: Identifier = ts.createIdentifier('useClass'),
        compileComponents: Identifier = ts.createIdentifier('compileComponents'),
        className: Identifier = ts.createIdentifier(name),
        masterServiceStub: Identifier = ts.createIdentifier('masterServiceStub'),
        MasterServiceStub: Identifier = ts.createIdentifier('MasterServiceStub');


    const declarationsProp: PropertyAssignment = ts.createPropertyAssignment(declarations, ts.createArrayLiteral([className]));

    const providersArray: ObjectLiteralExpression[] = stubs.map(stub => {
        return ts.createObjectLiteral([ts.createPropertyAssignment(provide, ts.createIdentifier(stub.provider)),
        ts.createPropertyAssignment(useClass, ts.createIdentifier(stub.class))])
    });

    const providersProp: PropertyAssignment = ts.createPropertyAssignment(providers, ts.createArrayLiteral(
        providersArray
    ));

    const configure: CallExpression = ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
        [declarationsProp, providersProp], true
    )])

    const master: ExpressionStatement = ts.createExpressionStatement(ts.createBinary(masterServiceStub, ts.createToken(ts.SyntaxKind.EqualsToken), ts.createNew(MasterServiceStub, undefined, undefined)));
    const setup: ExpressionStatement = ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>ts.createPropertyAccess(configure, <any>ts.createCall(compileComponents, undefined, undefined))));

    
    const statements: ExpressionStatement[] = useMasterServiceStub ? [master, setup] : [setup];

    return ts.createExpressionStatement(ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [createArrowFn(statements)])]));
}
