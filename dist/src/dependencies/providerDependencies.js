"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
let providerObj;
function getProviderDependencies(constructorParams, sourceFile) {
    providerObj = {};
    constructorParams.forEach((param) => {
        const provider = param.type.typeName.text;
        findProviderDependencies(provider, sourceFile);
    });
    return providerObj;
}
exports.getProviderDependencies = getProviderDependencies;
function findProviderDependencies(provider, sourceFile) {
    for (const childNode of sourceFile.statements) {
        if (typescript_1.default.isImportDeclaration(childNode)) {
            const namedBindings = childNode.importClause.namedBindings;
            const defaultImport = childNode.importClause.name;
            if (namedBindings) {
                setNamedBindings(namedBindings, provider, childNode);
            }
            if (defaultImport) {
                setDefaultImport(defaultImport, provider, childNode);
            }
        }
    }
}
function setNamedBindings(namedBindings, provider, childNode) {
    const imports = namedBindings.elements;
    for (const node of imports) {
        const providerPath = childNode.moduleSpecifier.text;
        if (node.name.text === provider && !providerObj[providerPath]) {
            providerObj[providerPath] = { [provider]: provider };
        }
        else if (node.name.text === provider) {
            providerObj[providerPath] = Object.assign(Object.assign({}, providerObj[providerPath]), { [provider]: provider });
        }
    }
}
function setDefaultImport(defaultImport, provider, childNode) {
    const providerPath = childNode.moduleSpecifier.text;
    if (provider === defaultImport.text && !providerObj[providerPath]) {
        providerObj[providerPath] = { default: provider };
    }
    else if (provider === defaultImport.text) {
        providerObj[providerPath] = Object.assign({ default: provider }, providerObj[providerPath]);
    }
}
