"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
function getImport(importNames, path) {
    const properties = [];
    importNames.forEach(name => properties.push(typescript_1.default.createIdentifier(name)));
    return typescript_1.default.createImportDeclaration(undefined, undefined, typescript_1.default.createImportClause(typescript_1.default.createObjectLiteral(properties), undefined), typescript_1.default.createLiteral(path));
}
exports.default = getImport;
