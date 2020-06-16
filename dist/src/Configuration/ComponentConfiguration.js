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
    getTestBedTemplate(testingModule) {
        return typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(identifiers_1.testBed, typescript_1.default.createPropertyAccess(testingModule, typescript_1.default.createCall(identifiers_1.compileComponents, undefined, undefined))));
    }
    getDeclarationsTemplate() {
        const className = typescript_1.default.createIdentifier(this.classNode.name.text);
        return typescript_1.default.createPropertyAssignment(identifiers_1.declarations, typescript_1.default.createArrayLiteral([className]));
    }
    getComponentFixtureTemplate() {
        return [
            typescript_1.default.createExpressionStatement(typescript_1.default.createBinary(identifiers_1.fixture, typescript_1.default.SyntaxKind.EqualsToken, typescript_1.default.createPropertyAccess(identifiers_1.testBed, typescript_1.default.createCall(identifiers_1.createComponent, undefined, [typescript_1.default.createIdentifier(this.classNode.name.text)])))),
            typescript_1.default.createExpressionStatement(typescript_1.default.createBinary(identifiers_1.component, typescript_1.default.SyntaxKind.EqualsToken, typescript_1.default.createPropertyAccess(identifiers_1.testBed, identifiers_1.componentInstance)))
        ];
    }
    getProvidersTemplate() {
        const providersArray = this.generateStubs();
        return typescript_1.default.createPropertyAssignment(identifiers_1.providers, typescript_1.default.createArrayLiteral(providersArray));
    }
    getConfigurationTemplate() {
        const testingModule = this.getTestingModuleTemplate([this.getDeclarationsTemplate(), this.getProvidersTemplate()]);
        return this.getConfiguration(this.getTestBedTemplate(testingModule), this.getComponentFixtureTemplate());
    }
}
exports.default = ComponentConfiguration;
