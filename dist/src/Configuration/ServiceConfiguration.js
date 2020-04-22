"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Configuration_1 = __importDefault(require("./Configuration"));
const typescript_1 = __importDefault(require("typescript"));
class ServiceConfiguration extends Configuration_1.default {
    constructor(dependencyObj, classNode, constructorParams, useMasterServiceStub) {
        super(dependencyObj, classNode, constructorParams, useMasterServiceStub);
    }
    getProviders(stubs, name) {
        const providers = typescript_1.default.createIdentifier('providers');
        const className = typescript_1.default.createIdentifier(name);
        const providersArray = this.getProviderStubs(stubs);
        return typescript_1.default.createPropertyAssignment(providers, typescript_1.default.createArrayLiteral([className, ...providersArray]));
    }
    getTestingModule(providers) {
        const configureTestingModule = typescript_1.default.createIdentifier('configureTestingModule');
        return typescript_1.default.createCall(configureTestingModule, undefined, [typescript_1.default.createObjectLiteral([providers], true)]);
    }
    getTestBed(testingModule) {
        const testBed = typescript_1.default.createIdentifier('TestBed');
        return typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(testBed, testingModule));
    }
    getConfigurationTemplate() {
        const providers = this.getProviders(this.generateStubs(), this.classNode.name.text);
        const testingModule = this.getTestingModule(providers);
        return this.getConfiguration(this.getTestBed(testingModule));
    }
}
exports.default = ServiceConfiguration;
