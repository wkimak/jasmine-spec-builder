"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const templates_1 = require("../templates");
const pathHelpers_1 = require("../pathHelpers");
const fs_1 = __importDefault(require("fs"));
class SpecFileBuilder {
    constructor() {
        this.imports = {};
    }
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
    setSourceFiles(componentFileName, specFileName) {
        this.targetFile = typescript_1.default.createSourceFile(specFileName, "", typescript_1.default.ScriptTarget.Latest, false);
        this.sourceFile = typescript_1.default.createSourceFile(componentFileName, fs_1.default.readFileSync(`${process.cwd()}/${componentFileName}`, 'utf8'), typescript_1.default.ScriptTarget.Latest);
        ;
    }
    buildDescribes(sourceFile, targetFile) {
        typescript_1.default.forEachChild(sourceFile, childNode => {
            if (typescript_1.default.isClassDeclaration(childNode) || typescript_1.default.isFunctionDeclaration(childNode) || typescript_1.default.isMethodDeclaration(childNode)) {
                const node = childNode;
                targetFile.statements = typescript_1.default.createNodeArray([...targetFile.statements, templates_1.getDescribe(node.name.text)]);
            }
            if (typescript_1.default.isClassDeclaration(childNode)) {
                this.classNode = childNode;
                this.mainDescribeBody = targetFile.statements[targetFile.statements.length - 1].expression.arguments[1].body;
                this.buildDescribes(childNode, this.mainDescribeBody);
            }
        });
    }
    generateStubs(useMasterServiceStub) {
        for (const member of this.classNode.members) {
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
    generateMasterServiceStubs(constructor) {
        const stubs = [];
        const stubName = 'MasterServiceStub';
        this.addImport(pathHelpers_1.findRelativeStubPath(stubName), stubName);
        constructor.parameters.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = `masterServiceStub.${provider.slice(0, 1).toLowerCase() + provider.slice(1)}Stub`;
            stubs.push({ provider, class: stubName });
            this.addImport(pathHelpers_1.findProviderPath(this.sourceFile, provider), provider);
        });
        return stubs;
    }
    generateNonMasterServiceStubs(constructor) {
        const stubs = [];
        constructor.parameters.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = provider + 'Stub';
            stubs.push({ provider, class: stubName });
            this.addImport(pathHelpers_1.findProviderPath(this.sourceFile, provider), provider);
            this.addImport(pathHelpers_1.findRelativeStubPath(stubName), stubName);
        });
        return stubs;
    }
    buildImports() {
        this.prependImport(['TestBed', 'async'], '@angular/core/testing');
        this.prependImport([this.classNode.name.text], `./${pathHelpers_1.removePathExtension(this.sourceFile.fileName)}`);
        for (const path in this.imports) {
            this.prependImport(this.imports[path], path);
        }
    }
    buildMasterServiceDeclaration() {
        this.mainDescribeBody.statements = typescript_1.default.createNodeArray([templates_1.getMasterServiceInit(), ...this.mainDescribeBody.statements]);
    }
    addImport(path, name) {
        if (!this.imports.hasOwnProperty(path)) {
            this.imports[path] = [name];
        }
        else {
            this.imports[path].push(name);
        }
    }
    prependImport(names, path) {
        this.targetFile.statements = typescript_1.default.createNodeArray([templates_1.getImport(names, path), ...this.targetFile.statements]);
    }
}
exports.SpecFileBuilder = SpecFileBuilder;
exports.default = SpecFileBuilder;
