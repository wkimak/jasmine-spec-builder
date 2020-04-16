"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const typescript_1 = __importDefault(require("typescript"));
function removePathExtension(path) {
    return path.slice(0, -3);
}
exports.removePathExtension = removePathExtension;
function findRelativeStubPath(stubName) {
    const specPath = process.cwd();
    const stubPath = searchFileSystem(stubName, path_1.default.dirname(specPath));
    return stubPath && path_1.default.relative(specPath, stubPath);
}
exports.findRelativeStubPath = findRelativeStubPath;
function findProviderPath(sourceFile, provider) {
    for (const childNode of sourceFile.statements) {
        if (typescript_1.default.isImportDeclaration(childNode)) {
            const imports = childNode.importClause.namedBindings.elements;
            const path = childNode.moduleSpecifier.text;
            for (const node of imports) {
                if (node.name.text === provider) {
                    return path;
                }
            }
        }
    }
}
exports.findProviderPath = findProviderPath;
function searchFileSystem(stubName, currentPath) {
    const excludedDirectories = {
        node_modules: true,
        dist: true,
        '.git': true
    };
    let fileFound;
    const inner = (currentPath) => {
        if (!fileFound) {
            const files = fs_1.default.readdirSync(currentPath);
            for (const file in files) {
                const currentFile = currentPath + '/' + files[file];
                const stats = fs_1.default.statSync(currentFile);
                if (stats.isFile() && path_1.default.basename(currentFile).toLowerCase() === stubName.toLowerCase() + '.ts') {
                    fileFound = removePathExtension(currentFile);
                }
                else if (stats.isDirectory() && !excludedDirectories.hasOwnProperty(path_1.default.basename(currentPath))) {
                    inner(currentFile);
                }
            }
        }
    };
    inner(currentPath);
    return fileFound;
}
exports.searchFileSystem = searchFileSystem;
