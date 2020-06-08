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
        const typeName = param.type.typeName;
        if (typeName) {
            const provider = typeName.text;
            findProviderDependencies(provider, sourceFile);
        }
    });
    return providerObj;
}
function findProviderDependencies(provider, sourceFile) {
    for (const childNode of sourceFile.statements) {
        if (typescript_1.default.isImportDeclaration(childNode)) {
            const importClause = childNode.importClause;
            const namedBindings = importClause.namedBindings;
            const defaultImport = importClause.name;
            const providerPath = childNode.moduleSpecifier.text;
            if (namedBindings) {
                setNamedBindings(namedBindings, provider, providerPath);
            }
            if (defaultImport) {
                setDefaultImport(defaultImport, provider, providerPath);
            }
        }
    }
}
function setNamedBindings(namedBindings, provider, providerPath) {
    const imports = namedBindings.elements;
    for (const node of imports) {
        if (node.name.text === provider && !providerObj[providerPath]) {
            providerObj[providerPath] = { [provider]: provider };
        }
        else if (node.name.text === provider) {
            providerObj[providerPath] = Object.assign(Object.assign({}, providerObj[providerPath]), { [provider]: provider });
        }
    }
}
function setDefaultImport(defaultImport, provider, providerPath) {
    if (provider === defaultImport.text && !providerObj[providerPath]) {
        providerObj[providerPath] = { default: provider };
    }
    else if (provider === defaultImport.text) {
        providerObj[providerPath] = Object.assign({ default: provider }, providerObj[providerPath]);
    }
}
exports.default = getProviderDependencies;
