"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const ComponentConfiguration_1 = __importDefault(require("./Configuration/ComponentConfiguration"));
const ServiceConfiguration_1 = __importDefault(require("./Configuration/ServiceConfiguration"));
const regex_1 = require("./shared/regex");
const SpecFileBuilder_1 = __importDefault(require("./SpecFileBuilder"));
const dependencies_1 = __importDefault(require("./dependencies/dependencies"));
const imports_1 = __importDefault(require("./imports/imports"));
const describes_1 = __importDefault(require("./describes/describes"));
class SpecFileCreate extends SpecFileBuilder_1.default {
    constructor(sourceFile, useMasterServiceStub) {
        super(sourceFile, useMasterServiceStub);
    }
    build(targetFile) {
        const dependencyObj = dependencies_1.default(this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub);
        const imports = imports_1.default(dependencyObj);
        const configuration = regex_1.isComponentFile.test(this.sourceFile.fileName) ?
            new ComponentConfiguration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate() :
            new ServiceConfiguration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate();
        const describes = describes_1.default(this.sourceFile, configuration);
        targetFile.statements = typescript_1.default.createNodeArray([...imports, ...describes]);
        return targetFile;
    }
}
exports.default = SpecFileCreate;
