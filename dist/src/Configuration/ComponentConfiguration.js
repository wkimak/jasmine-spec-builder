"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Configuration_1 = __importDefault(require("./Configuration"));
const typescript_1 = __importDefault(require("typescript"));
class ComponentConfiguration extends Configuration_1.default {
    constructor(dependencyObj, classNode, constructorParams, useMasterServiceStub) {
        super(dependencyObj, classNode, constructorParams, useMasterServiceStub);
    }
    getDeclarations() {
        const declarations = typescript_1.default.createIdentifier('declarations');
        const className = typescript_1.default.createIdentifier(this.classNode.name.text);
        return typescript_1.default.createPropertyAssignment(declarations, typescript_1.default.createArrayLiteral([className]));
    }
    getProviders(stubs) {
        const providers = typescript_1.default.createIdentifier('providers');
        const providersArray = this.getProviderStubs(stubs);
        return typescript_1.default.createPropertyAssignment(providers, typescript_1.default.createArrayLiteral(providersArray));
    }
    getTestingModule(declarations, providers) {
        const configureTestingModule = typescript_1.default.createIdentifier('configureTestingModule');
        return typescript_1.default.createCall(configureTestingModule, undefined, [typescript_1.default.createObjectLiteral([declarations, providers], true)]);
    }
    getTestBed(testingModule) {
        const testBed = typescript_1.default.createIdentifier('TestBed');
        const compileComponents = typescript_1.default.createIdentifier('compileComponents');
        return typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(testBed, typescript_1.default.createPropertyAccess(testingModule, typescript_1.default.createCall(compileComponents, undefined, undefined))));
    }
    getConfigurationTemplate() {
        const declarations = this.getDeclarations();
        const providers = this.getProviders(this.generateStubs());
        const testingModule = this.getTestingModule(declarations, providers);
        return this.getConfiguration(this.getTestBed(testingModule));
    }
}
exports.default = ComponentConfiguration;
