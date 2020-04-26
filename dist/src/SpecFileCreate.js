"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const Describes_1 = __importDefault(require("./Describes/Describes"));
const ComponentConfiguration_1 = __importDefault(require("./Configuration/ComponentConfiguration"));
const ServiceConfiguration_1 = __importDefault(require("./Configuration/ServiceConfiguration"));
const regex_1 = require("./shared/regex");
const SpecFileBuilder_1 = __importDefault(require("./SpecFileBuilder"));
class SpecFileCreate extends SpecFileBuilder_1.default {
    constructor(sourceFile, useMasterServiceStub) {
        super(sourceFile, useMasterServiceStub);
    }
    build(targetFile) {
        const configuration = regex_1.isComponentFile.test(this.sourceFile.fileName) ?
            new ComponentConfiguration_1.default(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate() :
            new ServiceConfiguration_1.default(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate();
        const describes = new Describes_1.default(this.sourceFile, configuration).getDescribesTemplate();
        targetFile.statements = typescript_1.default.createNodeArray([...this.imports, ...describes]);
        return targetFile;
    }
}
exports.default = SpecFileCreate;
