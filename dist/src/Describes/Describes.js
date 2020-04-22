"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const arrowFunction_1 = __importDefault(require("../shared/arrowFunction"));
class DescribesBuilder {
    constructor(sourceFile, configuration) {
        this.sourceFile = sourceFile;
        this.configuration = configuration;
    }
    getDescribe(name) {
        return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(typescript_1.default.createIdentifier('describe'), undefined, [typescript_1.default.createStringLiteral(name), arrowFunction_1.default()]));
    }
    getDescribesTemplate(sourceFile = this.sourceFile, describeBody = { statements: [] }) {
        typescript_1.default.forEachChild(sourceFile, childNode => {
            if (typescript_1.default.isClassDeclaration(childNode) || typescript_1.default.isFunctionDeclaration(childNode) || typescript_1.default.isMethodDeclaration(childNode)) {
                const node = childNode;
                describeBody.statements = [...describeBody.statements, this.getDescribe(node.name.text)];
            }
            if (typescript_1.default.isClassDeclaration(childNode)) {
                const body = describeBody.statements[0].expression.arguments[1].body;
                body.statements = this.configuration;
                this.getDescribesTemplate(childNode, body);
            }
        });
        return describeBody.statements;
    }
}
exports.default = DescribesBuilder;
