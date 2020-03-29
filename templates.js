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

function getConfiguration() {
    const beforeEach = ts.createIdentifier("beforeEach"),
        async = ts.createIdentifier('async'),
        testBed = ts.createIdentifier('TestBed'),
        configureTestingModule = ts.createIdentifier('configureTestingModule'),
        declarations = ts.createIdentifier('declarations'),
        compileComponents = ts.createIdentifier('compileComponents');

    const statements = [ts.createPropertyAccess(testBed, ts.createPropertyAccess(ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
        [ts.createPropertyAssignment(declarations, ts.createArrayLiteral())], true
    )]), ts.createCall(compileComponents)))];

    return ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [createArrowFn(statements)])]);
}

exports.getDescribe = getDescribe;
exports.getImport = getImport;
exports.getConfiguration = getConfiguration;
