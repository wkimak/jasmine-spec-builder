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
exports.default = getArrowFn;
