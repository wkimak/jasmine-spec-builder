"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
class ImportsBuilder {
    getImportDeclaration(dependencyObj, path) {
        return typescript_1.default.createImportDeclaration(undefined, undefined, typescript_1.default.createImportClause(typescript_1.default.createObjectLiteral(dependencyObj.paths[path].map((x) => typescript_1.default.createIdentifier(x))), undefined), typescript_1.default.createLiteral(path));
    }
    getImportsTemplate(dependencyObj) {
        const result = [];
        for (const path in dependencyObj.paths) {
            result.push(this.getImportDeclaration(dependencyObj, path));
        }
        return result;
    }
}
exports.default = ImportsBuilder;
