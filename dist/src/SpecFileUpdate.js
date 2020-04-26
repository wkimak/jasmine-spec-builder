"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const regex_1 = require("./shared/regex");
const ComponentConfiguration_1 = __importDefault(require("./Configuration/ComponentConfiguration"));
const ServiceConfiguration_1 = __importDefault(require("./Configuration/ServiceConfiguration"));
const SpecFileBuilder_1 = __importDefault(require("./SpecFileBuilder"));
class SpecFileUpdate extends SpecFileBuilder_1.default {
    constructor(sourceFile, useMasterServiceStub) {
        super(sourceFile, useMasterServiceStub);
    }
    removeImportSpecifiers(context) {
        return (rootNode) => {
            const visit = (node) => {
                if (typescript_1.default.isImportSpecifier(node) && this.dependencyObj.names[node.name.text]) {
                    return null;
                }
                return typescript_1.default.visitEachChild(node, visit, context);
            };
            return typescript_1.default.visitNode(rootNode, visit);
        };
    }
    removeImportDeclarations(context) {
        return (rootNode) => {
            const visit = (node) => {
                if (typescript_1.default.isImportDeclaration(node) && !node.importClause.namedBindings.elements.length) {
                    return null;
                }
                return typescript_1.default.visitEachChild(node, visit, context);
            };
            return typescript_1.default.visitNode(rootNode, visit);
        };
    }
    updateProviders(context) {
        return (rootNode) => {
            const visit = (node) => {
                if (typescript_1.default.isPropertyAssignment(node) && node.name.text === 'providers') {
                    const providers = regex_1.isComponentFile.test(this.sourceFile.fileName) ?
                        new ComponentConfiguration_1.default(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders() :
                        new ServiceConfiguration_1.default(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders();
                    return providers;
                }
                return typescript_1.default.visitEachChild(node, visit, context);
            };
            return typescript_1.default.visitNode(rootNode, visit);
        };
    }
    update(targetFile) {
        const rootNode = typescript_1.default.transform(targetFile, [
            this.removeImportSpecifiers.bind(this),
            this.removeImportDeclarations.bind(this),
            this.updateProviders.bind(this)
        ]).transformed[0];
        rootNode.statements = typescript_1.default.createNodeArray([...this.imports, ...rootNode.statements]);
        return rootNode;
    }
}
exports.default = SpecFileUpdate;
