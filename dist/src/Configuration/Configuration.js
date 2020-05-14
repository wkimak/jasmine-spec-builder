"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const arrowFunction_js_1 = __importDefault(require("../shared/arrowFunction.js"));
const helpers_js_1 = require("../shared/helpers.js");
const identifiers_js_1 = require("../shared/identifiers.js");
class Configuration {
    constructor(classNode, constructorParams, useMasterServiceStub) {
        this.classNode = classNode;
        this.constructorParams = constructorParams;
        this.useMasterServiceStub = useMasterServiceStub;
    }
    generateStubs() {
        const stubs = [];
        this.constructorParams.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = helpers_js_1.getStubName(provider);
            if (this.useMasterServiceStub) {
                const masterStubName = `masterServiceStub.${provider.slice(0, 1).toLowerCase() + provider.slice(1)}Stub`;
                stubs.push({ provider, class: masterStubName });
            }
            else {
                stubs.push({ provider, class: stubName });
            }
        });
        return stubs;
    }
    getProviderStubs(stubs) {
        return stubs.map(stub => {
            return typescript_1.default.createObjectLiteral([typescript_1.default.createPropertyAssignment(identifiers_js_1.provide, typescript_1.default.createIdentifier(stub.provider)),
                typescript_1.default.createPropertyAssignment(identifiers_js_1.useClass, typescript_1.default.createIdentifier(stub.class))]);
        });
    }
    getMasterServiceInit() {
        const masterInit = typescript_1.default.createAsExpression(typescript_1.default.createNew(identifiers_js_1.MasterServiceStub, undefined, undefined), undefined);
        return typescript_1.default.createVariableStatement(undefined, typescript_1.default.createVariableDeclarationList([typescript_1.default.createVariableDeclaration(identifiers_js_1.masterServiceStub, undefined, masterInit)], typescript_1.default.NodeFlags.Const));
    }
    getStatements(testBed) {
        return this.useMasterServiceStub ? [this.getMasterServiceInit(), testBed] : [testBed];
    }
    getConfiguration(testBed) {
        const statements = this.getStatements(testBed);
        const expression = typescript_1.default.createExpressionStatement(typescript_1.default.createCall(identifiers_js_1.beforeEach, undefined, [typescript_1.default.createCall(identifiers_js_1.async, undefined, [arrowFunction_js_1.default(statements)])]));
        return expression;
    }
}
exports.default = Configuration;
