"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const arrowFunctionTemplate_1 = __importDefault(require("../shared/arrowFunctionTemplate"));
const identifiers_1 = require("../shared/identifiers");
function getDescribeTemplate(name) {
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(identifiers_1.describe, undefined, [typescript_1.default.createStringLiteral(name), arrowFunctionTemplate_1.default()]));
}
function getDescribesTemplate(sourceFile, configuration, describeBody = { statements: [] }) {
    typescript_1.default.forEachChild(sourceFile, childNode => {
        if (typescript_1.default.isClassDeclaration(childNode) || typescript_1.default.isFunctionDeclaration(childNode) || typescript_1.default.isMethodDeclaration(childNode)) {
            const node = childNode;
            describeBody.statements = [...describeBody.statements, getDescribeTemplate(node.name.text)];
        }
        if (typescript_1.default.isClassDeclaration(childNode)) {
            const body = describeBody.statements[0].expression.arguments[1].body;
            body.statements = typescript_1.default.createNodeArray(configuration);
            getDescribesTemplate(childNode, configuration, body);
        }
    });
    return describeBody.statements;
}
exports.default = getDescribesTemplate;
