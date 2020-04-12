"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const configuration_1 = require("../shared/templates/configuration");
function getProviders(stubs, name) {
    const providers = typescript_1.default.createIdentifier('providers');
    const className = typescript_1.default.createIdentifier(name);
    const providersArray = configuration_1.getProviderStubs(stubs);
    return typescript_1.default.createPropertyAssignment(providers, typescript_1.default.createArrayLiteral([className, ...providersArray]));
}
function getTestingModule(providers) {
    const configureTestingModule = typescript_1.default.createIdentifier('configureTestingModule');
    return typescript_1.default.createCall(configureTestingModule, undefined, [typescript_1.default.createObjectLiteral([providers], true)]);
}
function getTestBed(testingModule) {
    const testBed = typescript_1.default.createIdentifier('TestBed');
    return typescript_1.default.createExpressionStatement(typescript_1.default.createPropertyAccess(testBed, testingModule));
}
function getServiceConfig(stubs, name) {
    const providers = getProviders(stubs, name);
    const testingModule = getTestingModule(providers);
    return getTestBed(testingModule);
}
exports.getServiceConfig = getServiceConfig;
