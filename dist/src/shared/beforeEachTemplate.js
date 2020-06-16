"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const identifiers_js_1 = require("../shared/identifiers.js");
function getBeforeEachTemplate(args) {
    return typescript_1.default.createExpressionStatement(typescript_1.default.createCall(identifiers_js_1.beforeEach, undefined, args));
}
exports.default = getBeforeEachTemplate;
