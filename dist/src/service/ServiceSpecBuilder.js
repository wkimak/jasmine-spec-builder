"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../shared/templates/configuration");
const typescript_1 = __importDefault(require("typescript"));
const SpecFileBuilder_1 = __importDefault(require("../shared/SpecFileBuilder"));
const configuration_2 = require("./configuration");
class ServiceSpecBuilder extends SpecFileBuilder_1.default {
    constructor(serviceFileName, specFileName, useMasterServiceStub) {
        super();
        this.setSourceFiles(serviceFileName, specFileName);
        this.buildDescribes(this.sourceFile, this.targetFile);
        this.buildConfiguration(this.generateStubs(useMasterServiceStub), useMasterServiceStub);
        this.buildImports();
        useMasterServiceStub && this.buildMasterServiceDeclaration();
    }
    buildConfiguration(stubs, useMasterServiceStub) {
        const config = configuration_1.getConfiguration(configuration_2.getServiceConfig(stubs, this.classNode.name.text), useMasterServiceStub);
        this.mainDescribeBody.statements = typescript_1.default.createNodeArray([config, ...this.mainDescribeBody.statements]);
    }
}
exports.ServiceSpecBuilder = ServiceSpecBuilder;
