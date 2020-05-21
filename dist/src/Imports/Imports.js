"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
function getImportDeclarationTemplate(path, names) {
    const nonDefaultImports = [];
    let defaultImport;
    for (const key in names) {
        if (key !== 'default') {
            nonDefaultImports.push(typescript_1.default.createImportSpecifier(undefined, typescript_1.default.createIdentifier(key)));
        }
        else {
            defaultImport = typescript_1.default.createIdentifier(names[key]);
        }
    }
    return typescript_1.default.createImportDeclaration(undefined, undefined, getImportClause(defaultImport, nonDefaultImports), typescript_1.default.createLiteral(path));
}
function getImportClause(defaultImport, nonDefaultImports) {
    if (defaultImport && nonDefaultImports.length) {
        return typescript_1.default.createImportClause(defaultImport, typescript_1.default.createNamedImports(nonDefaultImports));
    }
    else if (!defaultImport && nonDefaultImports.length) {
        return typescript_1.default.createImportClause(undefined, typescript_1.default.createNamedImports(nonDefaultImports));
    }
    else if (defaultImport && !nonDefaultImports.length) {
        return typescript_1.default.createImportClause(defaultImport, undefined);
    }
}
function getImportsTemplate(dependencyObj) {
    const result = [];
    for (const path in dependencyObj) {
        result.push(getImportDeclarationTemplate(path, dependencyObj[path]));
    }
    return result;
}
exports.default = getImportsTemplate;
