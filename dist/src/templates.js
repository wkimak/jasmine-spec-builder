"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
function createArrowFn(statements = []) {
    return typescript_1.default.createArrowFunction(undefined, undefined, [
        typescript_1.default.createParameter(undefined, undefined, undefined, typescript_1.default.createToken(null), undefined, undefined, undefined)
    ], undefined, typescript_1.default.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), typescript_1.default.createBlock(statements, true));
}
function getDescribe(name) {
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(typescript_1.default.createIdentifier('describe'), undefined, [typescript_1.default.createStringLiteral(name), createArrowFn()]));
}
exports.getDescribe = getDescribe;
function getImport(importNames, path) {
    const properties = [];
    importNames.forEach(name => properties.push(typescript_1.default.createIdentifier(name)));
    return typescript_1.default.createImportDeclaration(undefined, undefined, typescript_1.default.createImportClause(typescript_1.default.createObjectLiteral(properties), undefined), typescript_1.default.createLiteral(path));
}
exports.getImport = getImport;
function getMasterServiceInit() {
    return typescript_1.default.createVariableStatement(undefined, typescript_1.default.createVariableDeclarationList([typescript_1.default.createVariableDeclaration(typescript_1.default.createIdentifier('masterServiceStub'), typescript_1.default.createTypeReferenceNode(typescript_1.default.createIdentifier('MasterServiceStub'), undefined))]));
}
exports.getMasterServiceInit = getMasterServiceInit;
function getConfiguration(stubs, name, useMasterServiceStub) {
    const beforeEach = typescript_1.default.createIdentifier("beforeEach"), async = typescript_1.default.createIdentifier('async'), testBed = typescript_1.default.createIdentifier('TestBed'), configureTestingModule = typescript_1.default.createIdentifier('configureTestingModule'), declarations = typescript_1.default.createIdentifier('declarations'), providers = typescript_1.default.createIdentifier('providers'), provide = typescript_1.default.createIdentifier('provide'), useClass = typescript_1.default.createIdentifier('useClass'), compileComponents = typescript_1.default.createIdentifier('compileComponents'), className = typescript_1.default.createIdentifier(name), masterServiceStub = typescript_1.default.createIdentifier('masterServiceStub'), MasterServiceStub = typescript_1.default.createIdentifier('MasterServiceStub');
    const declarationsProp = typescript_1.default.createPropertyAssignment(declarations, typescript_1.default.createArrayLiteral([className]));
    const providersArray = stubs.map(stub => {
        return typescript_1.default.createObjectLiteral([typescript_1.default.createPropertyAssignment(provide, typescript_1.default.createIdentifier(stub.provider)),
            typescript_1.default.createPropertyAssignment(useClass, typescript_1.default.createIdentifier(stub.class))]);
    });
    const providersProp = typescript_1.default.createPropertyAssignment(providers, typescript_1.default.createArrayLiteral(providersArray));
    const configure = typescript_1.default.createCall(configureTestingModule, undefined, [typescript_1.default.createObjectLiteral([declarationsProp, providersProp], true)]);
    const master = typescript_1.default.createExpressionStatement(typescript_1.default.createBinary(masterServiceStub, typescript_1.default.createToken(typescript_1.default.SyntaxKind.EqualsToken), typescript_1.default.createNew(MasterServiceStub, undefined, undefined)));
    const setup = typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(testBed, typescript_1.default.createPropertyAccess(configure, typescript_1.default.createCall(compileComponents, undefined, undefined))));
    const statements = useMasterServiceStub ? [master, setup] : [setup];
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(beforeEach, undefined, [typescript_1.default.createCall(async, undefined, [createArrowFn(statements)])]));
}
exports.getConfiguration = getConfiguration;
