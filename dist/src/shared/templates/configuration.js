"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const arrowFunction_1 = __importDefault(require("./arrowFunction"));
function getProviderStubs(stubs) {
    const provide = typescript_1.default.createIdentifier('provide');
    const useClass = typescript_1.default.createIdentifier('useClass');
    return stubs.map(stub => {
        return typescript_1.default.createObjectLiteral([typescript_1.default.createPropertyAssignment(provide, typescript_1.default.createIdentifier(stub.provider)),
            typescript_1.default.createPropertyAssignment(useClass, typescript_1.default.createIdentifier(stub.class))]);
    });
}
exports.getProviderStubs = getProviderStubs;
function getConfiguration(testBed, useMasterServiceStub) {
    const beforeEach = typescript_1.default.createIdentifier("beforeEach");
    const async = typescript_1.default.createIdentifier('async');
    const masterServiceStub = typescript_1.default.createIdentifier('masterServiceStub');
    const MasterServiceStub = typescript_1.default.createIdentifier('MasterServiceStub');
    const master = typescript_1.default.createExpressionStatement(typescript_1.default.createBinary(masterServiceStub, typescript_1.default.createToken(typescript_1.default.SyntaxKind.EqualsToken), typescript_1.default.createNew(MasterServiceStub, undefined, undefined)));
    const statements = useMasterServiceStub ? [master, testBed] : [testBed];
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(beforeEach, undefined, [typescript_1.default.createCall(async, undefined, [arrowFunction_1.default(statements)])]));
}
exports.getConfiguration = getConfiguration;
