"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const arrowFunction_1 = __importDefault(require("./arrowFunction"));
function getDescribe(name) {
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(typescript_1.default.createIdentifier('describe'), undefined, [typescript_1.default.createStringLiteral(name), arrowFunction_1.default()]));
}
exports.default = getDescribe;
