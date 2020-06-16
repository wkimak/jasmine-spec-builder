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
    constructor(sourceFile, targetFile, useMasterServiceStub) {
        super(sourceFile, targetFile, useMasterServiceStub);
        this.recentProviderImportNames = { MasterServiceStub: true };
    }
    isProvidersArray(node) {
        return typescript_1.default.isPropertyAssignment(node) && node.name.text === 'providers';
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
    setRecentProviderImportNames(node) {
        if (this.isProvidersArray(node)) {
            node.initializer.elements.forEach(child => {
                if (child.hasOwnProperty('properties')) {
                    child.properties.forEach(prop => {
                        this.recentProviderImportNames[prop.initializer.text] = true;
                    });
                }
                else {
                    this.recentProviderImportNames[child.escapedText] = true;
                }
            });
        }
        return typescript_1.default.forEachChild(node, this.setRecentProviderImportNames.bind(this));
    }
    removeImportDeclarations(ctx) {
        const callback = (node) => {
            if (typescript_1.default.isImportDeclaration(node)) {
                if (node.importClause.namedBindings) {
                    for (const binding of node.importClause.namedBindings.elements) {
                        if (this.recentProviderImportNames.hasOwnProperty(binding.name.escapedText)) {
                            return null;
                        }
                    }
                }
                else if (this.recentProviderImportNames.hasOwnProperty(node.importClause.name.text)) {
                    return null;
                }
                if (this.dependencyObj.hasOwnProperty(node.moduleSpecifier.text)) {
                    return null;
                }
            }
        };
        return (rootNode) => typescript_1.default.visitNode(rootNode, this.visit(ctx, callback));
    }
    updateProviders(ctx) {
        const callback = (node) => {
            if (this.isProvidersArray(node)) {
                return regex_1.isComponentFile.test(this.sourceFile.fileName) ?
                    new ComponentConfiguration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getProvidersTemplate() :
                    new ServiceConfiguration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getProvidersTemplate();
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
            if (typescript_1.default.isExpressionStatement(node) && node.getFirstToken(this.targetFile).escapedText === 'TestBed') {
                const updatedProviders = typescript_1.default.transform(node, [this.updateProviders.bind(this)]).transformed[0];
                return new Configuration_1.default(this.classNode, this.constructorParams, this.useMasterServiceStub).getTestBedStatements(updatedProviders);
            }
        };
        return (rootNode) => typescript_1.default.visitNode(rootNode, this.visit(ctx, callback));
    }
    update() {
        this.dependencyObj = dependencies_1.default(this.isComponent, this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub);
        this.setRecentProviderImportNames(this.targetFile);
        const rootNode = typescript_1.default.transform(this.targetFile, [
            this.removeImportDeclarations.bind(this),
            this.updateTestBed.bind(this)
        ]).transformed[0];
        rootNode.statements = typescript_1.default.createNodeArray([...imports_1.default(this.dependencyObj), ...rootNode.statements]);
        return rootNode;
    }
}
exports.default = SpecFileUpdate;
