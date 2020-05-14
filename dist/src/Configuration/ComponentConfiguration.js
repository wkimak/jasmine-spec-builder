"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Configuration_1 = __importDefault(require("./Configuration"));
const typescript_1 = __importDefault(require("typescript"));
const identifiers_1 = require("../shared/identifiers");
class ComponentConfiguration extends Configuration_1.default {
    constructor(classNode, constructorParams, useMasterServiceStub) {
        super(classNode, constructorParams, useMasterServiceStub);
    }
    getDeclarations() {
        const className = typescript_1.default.createIdentifier(this.classNode.name.text);
        return typescript_1.default.createPropertyAssignment(identifiers_1.declarations, typescript_1.default.createArrayLiteral([className]));
    }
    getTestingModule(declarations, providers) {
        return typescript_1.default.createCall(identifiers_1.configureTestingModule, undefined, [typescript_1.default.createObjectLiteral([declarations, providers], true)]);
    }
    getTestBed(testingModule) {
        return typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(identifiers_1.testBed, typescript_1.default.createPropertyAccess(testingModule, typescript_1.default.createCall(identifiers_1.compileComponents, undefined, undefined))));
    }
    getProviders() {
        const stubs = this.generateStubs();
        const providersArray = this.getProviderStubs(stubs);
        return typescript_1.default.createPropertyAssignment(identifiers_1.providers, typescript_1.default.createArrayLiteral(providersArray));
    }
    getConfigurationTemplate() {
        const declarations = this.getDeclarations();
        const providers = this.getProviders();
        const testingModule = this.getTestingModule(declarations, providers);
        return this.getConfiguration(this.getTestBed(testingModule));
    }
}
exports.default = ComponentConfiguration;
