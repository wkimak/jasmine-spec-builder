"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const Imports_1 = __importDefault(require("./Imports/Imports"));
const Describes_1 = __importDefault(require("./Describes/Describes"));
const ComponentConfiguration_1 = __importDefault(require("./Configuration/ComponentConfiguration"));
const ServiceConfiguration_1 = __importDefault(require("./Configuration/ServiceConfiguration"));
const regex_1 = require("./shared/regex");
const Dependencies_1 = __importDefault(require("./Dependencies/Dependencies"));
const helpers_1 = require("./shared/helpers");
class SpecFileBuilder {
    constructor(sourceFile, useMasterServiceStub) {
        const classNode = helpers_1.findClassNode(sourceFile);
        const constructorParams = helpers_1.findConstructorParams(classNode);
        const dependancyObj = new Dependencies_1.default(sourceFile, classNode, constructorParams, useMasterServiceStub).getDependancyObj();
        const configuration = regex_1.isComponentFile.test(sourceFile.fileName) ?
            new ComponentConfiguration_1.default(dependancyObj, classNode, constructorParams, useMasterServiceStub).getConfigurationTemplate() :
            new ServiceConfiguration_1.default(dependancyObj, classNode, constructorParams, useMasterServiceStub).getConfigurationTemplate();
        this.imports = new Imports_1.default().getImportsTemplate(dependancyObj);
        this.describes = new Describes_1.default(sourceFile, configuration).getDescribesTemplate();
    }
    build(targetFile) {
        targetFile.statements = typescript_1.default.createNodeArray([...this.imports, ...this.describes]);
        return targetFile;
    }
}
exports.default = SpecFileBuilder;
