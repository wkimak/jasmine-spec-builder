"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
function findClassNode(sourceFile) {
    for (const childNode of sourceFile.statements) {
        if (typescript_1.default.isClassDeclaration(childNode)) {
            return childNode;
        }
    }
}
exports.findClassNode = findClassNode;
function findConstructorParams(classNode) {
    for (const member of classNode.members) {
        if (typescript_1.default.isConstructorDeclaration(member)) {
            return member.parameters;
        }
    }
}
exports.findConstructorParams = findConstructorParams;
;
