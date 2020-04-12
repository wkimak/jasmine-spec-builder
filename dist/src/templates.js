"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
function getArrowFn(statements = []) {
    return typescript_1.default.createArrowFunction(undefined, undefined, [
        typescript_1.default.createParameter(undefined, undefined, undefined, typescript_1.default.createToken(null), undefined, undefined, undefined)
    ], undefined, typescript_1.default.createToken(typescript_1.default.SyntaxKind.EqualsGreaterThanToken), typescript_1.default.createBlock(statements, true));
}
exports.getArrowFn = getArrowFn;
function getDescribe(name) {
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(typescript_1.default.createIdentifier('describe'), undefined, [typescript_1.default.createStringLiteral(name), getArrowFn()]));
}
exports.getDescribe = getDescribe;
function getImport(importNames, path) {
    const properties = [];
    importNames.forEach(name => properties.push(typescript_1.default.createIdentifier(name)));
    return typescript_1.default.createImportDeclaration(undefined, undefined, typescript_1.default.createImportClause(typescript_1.default.createObjectLiteral(properties), undefined), typescript_1.default.createLiteral(path));
}
exports.getImport = getImport;
function getMasterServiceInit() {
    return typescript_1.default.createVariableStatement(undefined, typescript_1.default.createVariableDeclarationList([typescript_1.default.createVariableDeclaration(typescript_1.default.createIdentifier('masterServiceStub'), typescript_1.default.createTypeReferenceNode(typescript_1.default.createIdentifier('MasterServiceStub'), undefined))], typescript_1.default.NodeFlags.Let));
}
exports.getMasterServiceInit = getMasterServiceInit;
