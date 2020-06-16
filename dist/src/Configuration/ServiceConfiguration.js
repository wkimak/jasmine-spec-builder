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
    getServiceDeclarationTemplate() {
        return typescript_1.default.createVariableStatement(undefined, typescript_1.default.createVariableDeclarationList([typescript_1.default.createVariableDeclaration(identifiers_1.service, typescript_1.default.createTypeReferenceNode(typescript_1.default.createIdentifier(this.classNode.name.text), undefined))], typescript_1.default.NodeFlags.Let));
    }
    getServiceInitTemplate() {
        return [
            typescript_1.default.createExpressionStatement(typescript_1.default.createBinary(identifiers_1.service, typescript_1.default.SyntaxKind.EqualsToken, typescript_1.default.createPropertyAccess(identifiers_1.testBed, typescript_1.default.createCall(identifiers_1.get, undefined, [typescript_1.default.createIdentifier(this.classNode.name.text)]))))
        ];
    }
    getConfigurationTemplate() {
        const testingModule = this.getTestingModuleTemplate([this.getProvidersTemplate()]);
        const testBed = this.getTestBedTemplate(testingModule);
        const serviceInit = this.getServiceInitTemplate();
        const serviceDeclaration = this.getServiceDeclarationTemplate();
        return this.getConfiguration([serviceDeclaration], testBed, serviceInit);
    }
}
exports.default = ServiceConfiguration;
