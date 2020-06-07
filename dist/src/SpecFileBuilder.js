"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
class SpecFileBuilder {
    constructor(sourceFile, targetFile, useMasterServiceStub) {
        this.sourceFile = sourceFile;
        this.targetFile = targetFile;
        this.useMasterServiceStub = useMasterServiceStub;
        this.classNode = this.findClassNode(sourceFile);
        this.constructorParams = this.findConstructorParams(this.classNode) || typescript_1.default.createNodeArray();
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
