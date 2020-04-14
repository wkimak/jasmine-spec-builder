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
class SpecFileBuilder {
    constructor(sourceFile, useMasterServiceStub) {
        this.classNode = this.findClassNode(sourceFile);
        this.constructorParams = this.findConstructorParams(this.classNode);
        this.imports = new Imports_1.default(sourceFile, this.classNode, this.constructorParams, useMasterServiceStub).getImportsTemplate();
        this.describes = new Describes_1.default(sourceFile).getDescribesTemplate();
        this.configuration = regex_1.isComponentFile.test(sourceFile.fileName) ?
            new ComponentConfiguration_1.default(this.classNode, this.constructorParams, useMasterServiceStub).getConfigurationTemplate() :
            new ServiceConfiguration_1.default(this.classNode, this.constructorParams, useMasterServiceStub).getConfigurationTemplate();
    }
    findClassNode(sourceFile) {
        for (const childNode of sourceFile.statements) {
            if (typescript_1.default.isClassDeclaration(childNode)) {
                return childNode;
            }
        }
    }
    findConstructorParams(classNode) {
        for (const member of classNode.members) {
            if (typescript_1.default.isConstructorDeclaration(member)) {
                return member.parameters;
            }
        }
    }
    ;
    build(targetFile) {
        this.describes.forEach(childNode => {
            const body = childNode.expression.arguments[1].body;
            const isClassDescribe = body.statements.length > 0;
            if (isClassDescribe) {
                body.statements = typescript_1.default.createNodeArray([...this.configuration, ...body.statements]);
            }
        });
        targetFile.statements = typescript_1.default.createNodeArray([...this.imports, ...this.describes]);
        return targetFile;
    }
}
exports.default = SpecFileBuilder;
// Differences
// Services
// Configuration is different:
// no Declarations array
// Service is listed as a provider
// potential to add imports specific to services (FormsModule)
// potential to add form field describe blocks
// resources
// Configuration is different:
// no Declarations array
// Resource is listed as a provider
// potential to add imports specific to resources (HttpRequestModule) 
// potential to add http request describe blocks based on HTTP verbs 
// Making methods independant:
// setSourceFiles must be called first
// set sourceFile
// set targetFile
// buildFile must be called last
