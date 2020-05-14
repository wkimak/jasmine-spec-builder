"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
exports.beforeEach = typescript_1.default.createIdentifier("beforeEach");
exports.async = typescript_1.default.createIdentifier('async');
exports.masterServiceStub = typescript_1.default.createIdentifier('masterServiceStub');
exports.MasterServiceStub = typescript_1.default.createIdentifier('MasterServiceStub');
exports.provide = typescript_1.default.createIdentifier('provide');
exports.useClass = typescript_1.default.createIdentifier('useClass');
exports.declarations = typescript_1.default.createIdentifier('declarations');
exports.testBed = typescript_1.default.createIdentifier('TestBed');
exports.compileComponents = typescript_1.default.createIdentifier('compileComponents');
exports.providers = typescript_1.default.createIdentifier('providers');
exports.configureTestingModule = typescript_1.default.createIdentifier('configureTestingModule');
exports.describe = typescript_1.default.createIdentifier('describe');
