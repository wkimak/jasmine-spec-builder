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
        const stubTemplates = [];
        this.constructorParams.forEach((param) => {
            const providerName = param.type.typeName.text;
            let stubName = helpers_js_1.getStubName(providerName);
            if (this.useMasterServiceStub) {
                stubName = helpers_js_1.getStubName(`masterServiceStub.${providerName.slice(0, 1).toLowerCase() + providerName.slice(1)}`);
            }
            stubTemplates.push(this.getProviderStubTemplate(providerName, stubName));
        });
        return stubTemplates;
    }
    getProviderStubTemplate(providerName, stubName) {
        return typescript_1.default.createObjectLiteral([typescript_1.default.createPropertyAssignment(identifiers_js_1.provide, typescript_1.default.createIdentifier(providerName)),
            typescript_1.default.createPropertyAssignment(identifiers_js_1.useClass, typescript_1.default.createIdentifier(stubName))]);
    }
    getTestingModuleTemplate(keyValues) {
        return typescript_1.default.createCall(identifiers_js_1.configureTestingModule, undefined, [typescript_1.default.createObjectLiteral(keyValues, true)]);
    }
    getMasterServiceInitTemplate() {
        const masterInit = typescript_1.default.createAsExpression(typescript_1.default.createNew(identifiers_js_1.MasterServiceStub, undefined, undefined), undefined);
        return typescript_1.default.createVariableStatement(undefined, typescript_1.default.createVariableDeclarationList([typescript_1.default.createVariableDeclaration(identifiers_js_1.masterServiceStub, undefined, masterInit)], typescript_1.default.NodeFlags.Const));
    }
    getTestBedStatements(testBed) {
        return this.useMasterServiceStub ? [this.getMasterServiceInitTemplate(), testBed] : [testBed];
    }
    getConfiguration(testBed) {
        const testBedStatements = this.getTestBedStatements(testBed);
        return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(identifiers_js_1.beforeEach, undefined, [typescript_1.default.createCall(identifiers_js_1.async, undefined, [arrowFunction_js_1.default(testBedStatements)])]));
    }
}
exports.default = Configuration;
