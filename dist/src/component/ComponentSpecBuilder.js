"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SpecFileBuilder_1 = __importDefault(require("../shared/SpecFileBuilder"));
const typescript_1 = __importDefault(require("typescript"));
const configuration_1 = require("./configuration");
const configuration_2 = require("../shared/templates/configuration");
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
        const config = configuration_2.getConfiguration(configuration_1.getComponentConfig(stubs, this.classNode.name.text), useMasterServiceStub);
        this.mainDescribeBody.statements = typescript_1.default.createNodeArray([config, ...this.mainDescribeBody.statements]);
    }
}
exports.ComponentSpecBuilder = ComponentSpecBuilder;
