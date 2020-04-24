"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Dependencies_1 = __importDefault(require("./Dependencies/Dependencies"));
const helpers_1 = require("./shared/helpers");
class SpecFileUpdate {
    constructor(sourceFile, targetFile, useMasterServiceStub) {
        const classNode = helpers_1.findClassNode(sourceFile);
        const constructorParams = helpers_1.findConstructorParams(classNode);
        this.dependancyObj = new Dependencies_1.default(sourceFile, classNode, constructorParams, useMasterServiceStub).getDependancyObj();
        console.log('DEP', this.dependancyObj);
        console.log('TARGET', targetFile);
    }
}
exports.default = SpecFileUpdate;
