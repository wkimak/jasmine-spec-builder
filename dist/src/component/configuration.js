"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const configuration_1 = require("../shared/templates/configuration");
function getDeclarations(name) {
    const declarations = typescript_1.default.createIdentifier('declarations');
    const className = typescript_1.default.createIdentifier(name);
    return typescript_1.default.createPropertyAssignment(declarations, typescript_1.default.createArrayLiteral([className]));
}
function getProviders(stubs) {
    const providers = typescript_1.default.createIdentifier('providers');
    const providersArray = configuration_1.getProviderStubs(stubs);
    return typescript_1.default.createPropertyAssignment(providers, typescript_1.default.createArrayLiteral(providersArray));
}
function getTestingModule(declarations, providers) {
    const configureTestingModule = typescript_1.default.createIdentifier('configureTestingModule');
    return typescript_1.default.createCall(configureTestingModule, undefined, [typescript_1.default.createObjectLiteral([declarations, providers], true)]);
}
function getTestBed(testingModule) {
    const testBed = typescript_1.default.createIdentifier('TestBed');
    const compileComponents = typescript_1.default.createIdentifier('compileComponents');
    return typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(testBed, typescript_1.default.createPropertyAccess(testingModule, typescript_1.default.createCall(compileComponents, undefined, undefined))));
}
function getComponentConfig(stubs, name) {
    const declarations = getDeclarations(name);
    const providers = getProviders(stubs);
    const testingModule = getTestingModule(declarations, providers);
    return getTestBed(testingModule);
}
exports.getComponentConfig = getComponentConfig;
