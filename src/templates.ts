import ts, { ExpressionStatement, ImportDeclaration, ArrowFunction, Statement, CallExpression, Identifier, PropertyAssignment, ObjectLiteralExpression } from 'typescript';

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

export function getConfiguration(stubs: { provider: string, class: string }[], name: string): ExpressionStatement {
    const beforeEach: Identifier = ts.createIdentifier("beforeEach"),
        async: Identifier = ts.createIdentifier('async'),
        testBed: Identifier = ts.createIdentifier('TestBed'),
        configureTestingModule: Identifier = ts.createIdentifier('configureTestingModule'),
        declarations: Identifier = ts.createIdentifier('declarations'),
        providers: Identifier = ts.createIdentifier('providers'),
        provide: Identifier = ts.createIdentifier('provide'),
        useClass: Identifier = ts.createIdentifier('useClass'),
        compileComponents: Identifier = ts.createIdentifier('compileComponents'),
        className: Identifier = ts.createIdentifier(name);


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

    const statements: ExpressionStatement[] = [ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>ts.createPropertyAccess(configure, <any>ts.createCall(compileComponents, undefined, undefined))))];

    return ts.createExpressionStatement(ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [createArrowFn(statements)])]));
}
