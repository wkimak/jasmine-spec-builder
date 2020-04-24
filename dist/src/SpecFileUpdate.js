"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const Dependencies_1 = __importDefault(require("./Dependencies/Dependencies"));
const helpers_1 = require("./shared/helpers");
const regex_1 = require("./shared/regex");
const ComponentConfiguration_1 = __importDefault(require("./Configuration/ComponentConfiguration"));
const ServiceConfiguration_1 = __importDefault(require("./Configuration/ServiceConfiguration"));
class SpecFileUpdate {
    constructor(sourceFile, useMasterServiceStub) {
        const classNode = helpers_1.findClassNode(sourceFile);
        const constructorParams = helpers_1.findConstructorParams(classNode);
        const dependancyObj = new Dependencies_1.default(sourceFile, classNode, constructorParams, useMasterServiceStub).getDependancyObj();
        this.providers = regex_1.isComponentFile.test(sourceFile.fileName) ?
            new ComponentConfiguration_1.default(dependancyObj, classNode, constructorParams, useMasterServiceStub).getProviders() :
            new ServiceConfiguration_1.default(dependancyObj, classNode, constructorParams, useMasterServiceStub).getProviders();
    }
    updateProviders(context) {
        return (rootNode) => {
            const visit = (node) => {
                if (typescript_1.default.isPropertyAssignment(node) && node.name.text === 'providers') {
                    return this.providers;
                }
                return typescript_1.default.visitEachChild(node, visit, context);
            };
            return typescript_1.default.visitNode(rootNode, visit);
        };
    }
    update(targetFile) {
        return typescript_1.default.transform(targetFile, [this.updateProviders.bind(this)]).transformed[0];
    }
}
exports.default = SpecFileUpdate;
