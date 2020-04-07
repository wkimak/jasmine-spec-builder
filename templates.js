const ts = require('typescript');

function createArrowFn(statements = []) {
    return ts.createArrowFunction(
        undefined,
        undefined,
        [
            ts.createParameter(undefined, undefined, undefined, ts.createToken(null), undefined, undefined, undefined)
        ],
        undefined,
        ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.createBlock(statements, true)
    );
}

function getDescribe(name) {
    return ts.createMethodSignature(undefined, [ts.createStringLiteral(name), createArrowFn()], undefined, 'describe', undefined);
}

function getImport(importNames, path) {
    const properties = [];
    importNames.forEach(name => properties.push(ts.createIdentifier(name)));
    return ts.createImportDeclaration(undefined, undefined, ts.createImportClause(
        ts.createObjectLiteral(properties)), ts.createLiteral(path));
}

function getConfiguration(stubs, name) {
    const beforeEach = ts.createIdentifier("beforeEach"),
        async = ts.createIdentifier('async'),
        testBed = ts.createIdentifier('TestBed'),
        configureTestingModule = ts.createIdentifier('configureTestingModule'),
        declarations = ts.createIdentifier('declarations'),
        providers = ts.createIdentifier('providers'),
        provide = ts.createIdentifier('provide'),
        useClass = ts.createIdentifier('useClass'),
        compileComponents = ts.createIdentifier('compileComponents'),
        className = ts.createIdentifier(name);


    const declarationsProp = ts.createPropertyAssignment(declarations, ts.createArrayLiteral([className]));

    const providersArray = stubs.map(stub => {
        return ts.createObjectLiteral([ts.createPropertyAssignment(provide, ts.createIdentifier(stub.provider)),
        ts.createPropertyAssignment(useClass, ts.createIdentifier(stub.class))])
    });

    const providersProp = ts.createPropertyAssignment(providers, ts.createArrayLiteral(
        providersArray
    ));

    const configure = ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
        [declarationsProp, providersProp], true
    )])

    const statements = [ts.createPropertyAccess(testBed, ts.createPropertyAccess(configure, ts.createCall(compileComponents)))];

    return ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [createArrowFn(statements)])]);
}


exports.getDescribe = getDescribe;
exports.getImport = getImport;
exports.getConfiguration = getConfiguration;
