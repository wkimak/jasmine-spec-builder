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
const Configuration_1 = __importDefault(require("./Configuration/Configuration"));
const dependencies_1 = __importDefault(require("./dependencies/dependencies"));
const imports_1 = __importDefault(require("./imports/imports"));
class SpecFileUpdate extends SpecFileBuilder_1.default {
    constructor(sourceFile, useMasterServiceStub) {
        super(sourceFile, useMasterServiceStub);
    }
    removeImportDeclarations(ctx) {
        const callback = (node) => {
            if (typescript_1.default.isImportDeclaration(node) && this.dependencyObj.hasOwnProperty(node.moduleSpecifier.text)) {
                return null;
            }
        };
        return (rootNode) => typescript_1.default.visitNode(rootNode, this.visit(ctx, callback));
    }
    removeImportDeclarationsByName(ctx) {
        const callback = (node) => {
            if (typescript_1.default.isImportDeclaration(node)) {
                let isProviderImport = false;
                if (node.importClause.namedBindings) {
                    node.importClause.namedBindings.elements.forEach(i => {
                        if (this.currentProviders.hasOwnProperty(i.name.escapedText)) {
                            isProviderImport = true;
                        }
                    });
                }
                else {
                    if (this.currentProviders.hasOwnProperty(node.importClause.name.text)) {
                        return null;
                    }
                }
                if (isProviderImport) {
                    return null;
                }
            }
        };
        return (rootNode) => typescript_1.default.visitNode(rootNode, this.visit(ctx, callback));
    }
    findProviders(node) {
        if (typescript_1.default.isPropertyAssignment(node) && node.name.text === 'providers') {
            const names = { MasterServiceStub: true };
            node.initializer.elements.forEach(child => {
                if (child.hasOwnProperty('properties')) {
                    child.properties.forEach(prop => {
                        names[prop.initializer.text] = true;
                    });
                }
                else {
                    names[child.escapedText] = true;
                }
            });
            return names;
        }
        return typescript_1.default.forEachChild(node, this.findProviders.bind(this));
    }
    updateProviders(ctx) {
        const callback = (node) => {
            if (typescript_1.default.isPropertyAssignment(node) && node.name.text === 'providers') {
                const providers = regex_1.isComponentFile.test(this.sourceFile.fileName) ?
                    new ComponentConfiguration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders() :
                    new ServiceConfiguration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getProviders();
                return providers;
            }
        };
        return (rootNode) => typescript_1.default.visitNode(rootNode, this.visit(ctx, callback));
    }
    updateTestBed(ctx) {
        const callback = (node) => {
            if (typescript_1.default.isVariableStatement(node)) {
                if (node.declarationList.declarations[0].name.escapedText === 'masterServiceStub') {
                    return null;
                }
            }
            console.log('NODE', node);
            if (typescript_1.default.isExpressionStatement(node) && node.getFirstToken(this.targetFile).escapedText === 'TestBed') {
                const updatedProviders = typescript_1.default.transform(node, [this.updateProviders.bind(this)]).transformed[0];
                return new Configuration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getStatements(updatedProviders);
            }
        };
        return (rootNode) => typescript_1.default.visitNode(rootNode, this.visit(ctx, callback));
    }
    visit(ctx, callback) {
        const visitor = (node) => {
            const result = callback(node);
            if (result !== undefined) {
                return result;
            }
            return typescript_1.default.visitEachChild(node, visitor, ctx);
        };
        return visitor;
    }
    update(targetFile) {
        this.targetFile = targetFile;
        this.dependencyObj = dependencies_1.default(this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub);
        this.currentProviders = this.findProviders(targetFile);
        const rootNode = typescript_1.default.transform(targetFile, [
            this.removeImportDeclarations.bind(this),
            this.removeImportDeclarationsByName.bind(this),
            this.updateTestBed.bind(this)
        ]).transformed[0];
        rootNode.statements = typescript_1.default.createNodeArray([...imports_1.default(this.dependencyObj), ...rootNode.statements]);
        return rootNode;
    }
}
exports.default = SpecFileUpdate;
