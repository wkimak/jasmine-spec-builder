"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Configuration_1 = __importDefault(require("./Configuration"));
const typescript_1 = __importDefault(require("typescript"));
const identifiers_1 = require("../shared/identifiers");
class ServiceConfiguration extends Configuration_1.default {
    constructor(classNode, constructorParams, useMasterServiceStub) {
        super(classNode, constructorParams, useMasterServiceStub);
    }
    getTestBedTemplate(testingModule) {
        return typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(identifiers_1.testBed, testingModule));
    }
    getProvidersTemplate() {
        const className = typescript_1.default.createIdentifier(this.classNode.name.text);
        const providersArray = this.generateStubs();
        return typescript_1.default.createPropertyAssignment(identifiers_1.providers, typescript_1.default.createArrayLiteral([className, ...providersArray]));
    }
    getConfigurationTemplate() {
        const testingModule = this.getTestingModuleTemplate([this.getProvidersTemplate()]);
        return this.getConfiguration(this.getTestBedTemplate(testingModule));
    }
}
exports.default = ServiceConfiguration;
