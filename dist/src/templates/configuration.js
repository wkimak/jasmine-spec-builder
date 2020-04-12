"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const templates_1 = require("../templates");
const useClass = typescript_1.default.createIdentifier('useClass'), provide = typescript_1.default.createIdentifier('provide'), providers = typescript_1.default.createIdentifier('providers'), declarations = typescript_1.default.createIdentifier('declarations'), beforeEach = typescript_1.default.createIdentifier("beforeEach"), async = typescript_1.default.createIdentifier('async'), testBed = typescript_1.default.createIdentifier('TestBed'), configureTestingModule = typescript_1.default.createIdentifier('configureTestingModule'), compileComponents = typescript_1.default.createIdentifier('compileComponents'), masterServiceStub = typescript_1.default.createIdentifier('masterServiceStub'), MasterServiceStub = typescript_1.default.createIdentifier('MasterServiceStub');
function getProviderStubs(stubs) {
    return stubs.map(stub => {
        return typescript_1.default.createObjectLiteral([typescript_1.default.createPropertyAssignment(provide, typescript_1.default.createIdentifier(stub.provider)),
            typescript_1.default.createPropertyAssignment(useClass, typescript_1.default.createIdentifier(stub.class))]);
    });
}
function getComponentDeclarations(name) {
    const className = typescript_1.default.createIdentifier(name);
    return typescript_1.default.createPropertyAssignment(declarations, typescript_1.default.createArrayLiteral([className]));
}
exports.getComponentDeclarations = getComponentDeclarations;
function getComponentProviders(stubs) {
    const providersArray = getProviderStubs(stubs);
    return typescript_1.default.createPropertyAssignment(providers, typescript_1.default.createArrayLiteral(providersArray));
}
exports.getComponentProviders = getComponentProviders;
function getServiceDeclarations() {
    return typescript_1.default.createPropertyAssignment(declarations, typescript_1.default.createArrayLiteral());
}
exports.getServiceDeclarations = getServiceDeclarations;
function getServiceProviders(stubs, name) {
    const className = typescript_1.default.createIdentifier(name), providersArray = getProviderStubs(stubs);
    return typescript_1.default.createPropertyAssignment(providers, typescript_1.default.createArrayLiteral([className, ...providersArray]));
}
exports.getServiceProviders = getServiceProviders;
function getConfiguration(declarations, providers, useMasterServiceStub) {
    const configure = typescript_1.default.createCall(configureTestingModule, undefined, [typescript_1.default.createObjectLiteral([declarations, providers], true)]);
    const master = typescript_1.default.createExpressionStatement(typescript_1.default.createBinary(masterServiceStub, typescript_1.default.createToken(typescript_1.default.SyntaxKind.EqualsToken), typescript_1.default.createNew(MasterServiceStub, undefined, undefined)));
    const setup = typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(testBed, typescript_1.default.createPropertyAccess(configure, typescript_1.default.createCall(compileComponents, undefined, undefined))));
    const statements = useMasterServiceStub ? [master, setup] : [setup];
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(beforeEach, undefined, [typescript_1.default.createCall(async, undefined, [templates_1.getArrowFn(statements)])]));
}
exports.getConfiguration = getConfiguration;
