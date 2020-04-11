"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const templates_1 = require("./templates");
const pathHelpers_1 = require("./pathHelpers");
const fs_1 = __importDefault(require("fs"));
class SpecFileBuilder {
    constructor(componentFileName, specFileName, useMasterServiceStub) {
        this.imports = {};
        this.setSourceFiles(componentFileName, specFileName);
        this.buildDescribes(this.componentFile, this.specFile);
        this.buildConfiguration(this.generateStubs(useMasterServiceStub), useMasterServiceStub);
        this.buildImports();
        useMasterServiceStub && this.buildMasterServiceDeclaration();
    }
    setSourceFiles(componentFileName, specFileName) {
        this.specFile = typescript_1.default.createSourceFile(specFileName, "", typescript_1.default.ScriptTarget.Latest, false);
        this.componentFile = typescript_1.default.createSourceFile(componentFileName, fs_1.default.readFileSync(`${process.cwd()}/${componentFileName}`, 'utf8'), typescript_1.default.ScriptTarget.Latest);
        ;
    }
    buildDescribes(componentFile, specFile) {
        typescript_1.default.forEachChild(componentFile, childNode => {
            if (typescript_1.default.isClassDeclaration(childNode) || typescript_1.default.isFunctionDeclaration(childNode) || typescript_1.default.isMethodDeclaration(childNode)) {
                const node = childNode;
                specFile.statements = typescript_1.default.createNodeArray([...specFile.statements, templates_1.getDescribe(node.name.text)]);
            }
            if (typescript_1.default.isClassDeclaration(childNode)) {
                this.componentClassNode = childNode;
                this.mainDescribeBody = specFile.statements[specFile.statements.length - 1].expression.arguments[1].body;
                this.buildDescribes(childNode, this.mainDescribeBody);
            }
        });
    }
    addImport(path, name) {
        if (!this.imports.hasOwnProperty(path)) {
            this.imports[path] = [name];
        }
        else {
            this.imports[path].push(name);
        }
    }
    generateMasterServiceStubs(constructor) {
        const stubs = [];
        const stubName = 'MasterServiceStub';
        this.addImport(pathHelpers_1.findRelativeStubPath(stubName), stubName);
        constructor.parameters.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = `masterServiceStub.${provider.slice(0, 1).toLowerCase() + provider.slice(1)}Stub`;
            stubs.push({ provider, class: stubName });
            this.addImport(pathHelpers_1.findProviderPath(this.componentFile, provider), provider);
        });
        return stubs;
    }
    generateNonMasterServiceStubs(constructor) {
        const stubs = [];
        constructor.parameters.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = provider + 'Stub';
            stubs.push({ provider, class: stubName });
            this.addImport(pathHelpers_1.findProviderPath(this.componentFile, provider), provider);
            this.addImport(pathHelpers_1.findRelativeStubPath(stubName), stubName);
        });
        return stubs;
    }
    generateStubs(useMasterServiceStub) {
        for (const member of this.componentClassNode.members) {
            if (typescript_1.default.isConstructorDeclaration(member)) {
                if (useMasterServiceStub) {
                    return this.generateMasterServiceStubs(member);
                }
                else {
                    return this.generateNonMasterServiceStubs(member);
                }
            }
        }
        return [];
    }
    buildConfiguration(stubs, useMasterServiceStub) {
        const config = templates_1.getConfiguration(stubs, this.componentClassNode.name.text, useMasterServiceStub);
        this.mainDescribeBody.statements = typescript_1.default.createNodeArray([config, ...this.mainDescribeBody.statements]);
    }
    buildImports() {
        this.prependImport(['TestBed', 'async'], '@angular/core/testing');
        this.prependImport([this.componentClassNode.name.text], `./${pathHelpers_1.removePathExtension(this.componentFile.fileName)}`);
        for (const path in this.imports) {
            this.prependImport(this.imports[path], path);
        }
    }
    prependImport(names, path) {
        this.specFile.statements = typescript_1.default.createNodeArray([templates_1.getImport(names, path), ...this.specFile.statements]);
    }
    buildMasterServiceDeclaration() {
        this.mainDescribeBody.statements = typescript_1.default.createNodeArray([templates_1.getMasterServiceInit(), ...this.mainDescribeBody.statements]);
    }
}
exports.SpecFileBuilder = SpecFileBuilder;
exports.default = SpecFileBuilder;
