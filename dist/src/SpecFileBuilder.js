"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const Dependencies_1 = __importDefault(require("./Dependencies/Dependencies"));
const Imports_1 = __importDefault(require("./Imports/Imports"));
class SpecFileBuilder {
    constructor(sourceFile, useMasterServiceStub) {
        this.sourceFile = sourceFile;
        this.useMasterServiceStub = useMasterServiceStub;
        this.classNode = this.findClassNode(sourceFile);
        this.constructorParams = this.findConstructorParams(this.classNode);
        this.dependencyObj = new Dependencies_1.default(this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub).getDependancyObj();
        this.imports = new Imports_1.default().getImportsTemplate(this.dependencyObj);
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
}
exports.default = SpecFileBuilder;
