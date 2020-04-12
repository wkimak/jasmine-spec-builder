"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SpecFileBuilder_1 = __importDefault(require("./SpecFileBuilder"));
const typescript_1 = __importDefault(require("typescript"));
const configuration_1 = require("../templates/configuration");
class ComponentSpecBuilder extends SpecFileBuilder_1.default {
    constructor(componentFileName, specFileName, useMasterServiceStub) {
        super();
        this.setSourceFiles(componentFileName, specFileName);
        this.buildDescribes(this.sourceFile, this.targetFile);
        this.buildConfiguration(this.generateStubs(useMasterServiceStub), useMasterServiceStub);
        this.buildImports();
        useMasterServiceStub && this.buildMasterServiceDeclaration();
    }
    buildConfiguration(stubs, useMasterServiceStub) {
        const providers = configuration_1.getComponentProviders(stubs);
        const declarations = configuration_1.getComponentDeclarations(this.classNode.name.text);
        const config = configuration_1.getConfiguration(providers, declarations, useMasterServiceStub);
        this.mainDescribeBody.statements = typescript_1.default.createNodeArray([config, ...this.mainDescribeBody.statements]);
    }
}
exports.ComponentSpecBuilder = ComponentSpecBuilder;
