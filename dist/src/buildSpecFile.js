"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const templates_1 = require("./templates");
function prependImport(sourceFile, names, path) {
    sourceFile.statements = typescript_1.default.createNodeArray([templates_1.getImport(names, path), ...sourceFile.statements]);
}
function removePathExtension(path) {
    return path.slice(0, -3);
}
function createSpecFile(componentFile, specFile, useMasterServiceStub) {
    typescript_1.default.forEachChild(componentFile, childNode => {
        if (typescript_1.default.isClassDeclaration(childNode) || typescript_1.default.isFunctionDeclaration(childNode) || typescript_1.default.isMethodDeclaration(childNode)) {
            const node = childNode;
            specFile.statements = typescript_1.default.createNodeArray([...specFile.statements, templates_1.getDescribe(node.name.text)]);
        }
        if (typescript_1.default.isClassDeclaration(childNode)) {
            const className = childNode.name.text;
            const body = specFile.statements[specFile.statements.length - 1].expression.arguments[1].body;
            const stubs = createStubs(componentFile, childNode, specFile, useMasterServiceStub);
            body.statements = typescript_1.default.createNodeArray([templates_1.getMasterServiceInit(), templates_1.getConfiguration(stubs, className, useMasterServiceStub)]);
            prependImport(specFile, ['TestBed', 'async'], '@angular/core/testing');
            prependImport(specFile, [className], `./${removePathExtension(componentFile.fileName)}`);
            createSpecFile(childNode, body, useMasterServiceStub);
        }
    });
    return specFile;
}
function createStubs(componentFile, classNode, specFile, useMasterServiceStub) {
    const stubs = [];
    for (const childNode of classNode.members) {
        if (typescript_1.default.isConstructorDeclaration(childNode)) {
            childNode.parameters.forEach((param) => {
                const provider = param.type.typeName.text;
                const stubName = useMasterServiceStub ? 'MasterServiceStub' : provider + 'Stub';
                stubs.push({ provider, class: useMasterServiceStub ? `masterServiceStub.${provider.toLowerCase()}Stub` : stubName });
                createRelativeStubPath(stubName, specFile);
                findImportForDI(specFile, componentFile, provider);
            });
            return stubs;
        }
    }
    ;
    return stubs;
}
function findImportForDI(specFile, componentFile, provider) {
    for (const childNode of componentFile.statements) {
        if (typescript_1.default.isImportDeclaration(childNode)) {
            const imports = childNode.importClause.namedBindings.elements;
            const path = childNode.moduleSpecifier.text;
            imports.forEach(node => {
                if (node.name.text === provider) {
                    prependImport(specFile, [provider], path);
                }
            });
        }
    }
}
function createRelativeStubPath(stubName, specFile) {
    const specPath = process.cwd();
    const stubPath = findStubPath(stubName, path_1.default.dirname(specPath));
    const relativePath = path_1.default.relative(specPath, stubPath);
    prependImport(specFile, [stubName], relativePath);
}
function findStubPath(stubName, currentPath) {
    const excludedDirectories = {
        node_modules: true,
        dist: true,
        '.git': true
    };
    let fileFound;
    function inner(currentPath) {
        if (!fileFound) {
            const files = fs_1.default.readdirSync(currentPath);
            for (const file in files) {
                const currentFile = currentPath + '/' + files[file];
                const stats = fs_1.default.statSync(currentFile);
                if (stats.isFile() && path_1.default.basename(currentFile) === stubName + '.ts') {
                    fileFound = removePathExtension(currentFile);
                }
                else if (stats.isDirectory() && !excludedDirectories.hasOwnProperty(path_1.default.basename(currentPath))) {
                    inner(currentFile);
                }
            }
        }
    }
    inner(currentPath);
    return fileFound;
}
exports.default = createSpecFile;
