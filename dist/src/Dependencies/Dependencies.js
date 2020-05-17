"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const providerDependencies_1 = __importDefault(require("./providerDependencies"));
const stubDependencies_1 = __importDefault(require("./stubDependencies"));
const helpers_1 = require("../shared/helpers");
let dependencyObj;
function addDependency(obj) {
    dependencyObj = Object.assign(Object.assign({}, dependencyObj), obj);
}
function getDependency(fileName, stubName) {
    const obj = stubDependencies_1.default(fileName, stubName);
    if (obj) {
        addDependency(obj);
    }
}
;
function getDependancyObj(sourceFile, classNode, constructorParams, useMasterServiceStub) {
    dependencyObj = {
        '@angular/core/testing': { TestBed: 'TestBed', async: 'async' }
    };
    let provider;
    if (useMasterServiceStub) {
        provider = 'MasterService';
        getDependency(helpers_1.getStubFileName(provider), helpers_1.getStubName(provider));
    }
    else {
        constructorParams.forEach((param) => {
            provider = param.type.typeName.text;
            getDependency(helpers_1.getStubFileName(provider), helpers_1.getStubName(provider));
        });
    }
    getDependency(sourceFile.fileName, classNode.name.text);
    addDependency(providerDependencies_1.default(constructorParams, sourceFile));
    return dependencyObj;
}
exports.default = getDependancyObj;
