"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const arrowFunctionTemplate_js_1 = __importDefault(require("../shared/arrowFunctionTemplate.js"));
const helpers_js_1 = require("../shared/helpers.js");
const beforeEachTemplate_1 = __importDefault(require("../shared/beforeEachTemplate"));
const identifiers_js_1 = require("../shared/identifiers.js");
class Configuration {
    constructor(dependencyObj, classNode, constructorParams, useMasterServiceStub) {
        this.dependencyObj = dependencyObj;
        this.classNode = classNode;
        this.constructorParams = constructorParams;
        this.useMasterServiceStub = useMasterServiceStub;
    }
    generateStubs() {
        const stubTemplates = [];
        this.constructorParams.forEach((param) => {
            const typeName = param.type.typeName;
            if (typeName) {
                const providerName = typeName.text;
                let stubName = helpers_js_1.getStubName(providerName);
                const dependencyNames = Object.values(this.dependencyObj).reduce(((r, c) => Object.assign(r, c)), {});
                if (dependencyNames[stubName]) {
                    if (this.useMasterServiceStub) {
                        stubName = helpers_js_1.getStubName(`masterServiceStub.${providerName.slice(0, 1).toLowerCase() + providerName.slice(1)}`);
                    }
                    stubTemplates.push(this.getProviderStubTemplate(providerName, stubName));
                }
                else {
                    stubTemplates.push(typescript_1.default.createIdentifier(providerName));
                }
            }
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
    getConfiguration(variableDeclarations, testBed, classInit) {
        const testBedStatements = this.getTestBedStatements(testBed);
        const configBeforeEach = beforeEachTemplate_1.default([typescript_1.default.createCall(identifiers_js_1.async, undefined, [arrowFunctionTemplate_js_1.default(testBedStatements)])]);
        const classInitBeforeEach = beforeEachTemplate_1.default([arrowFunctionTemplate_js_1.default(classInit)]);
        return [...variableDeclarations, configBeforeEach, classInitBeforeEach];
    }
}
exports.default = Configuration;
