"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const providerDependencies_1 = require("./providerDependencies");
const dependencyHelpers_1 = require("./dependencyHelpers");
const helpers_1 = require("../shared/helpers");
let dependencyObj;
function addDependency(obj) {
    dependencyObj = Object.assign(Object.assign({}, dependencyObj), obj);
}
function getDependency(fileName, name) {
    const obj = dependencyHelpers_1.getDependencyPathAndExports(fileName, name);
    if (obj) {
        addDependency(obj);
    }
}
;
function getDependancyObj(sourceFile, classNode, constructorParams, useMasterServiceStub) {
    dependencyObj = {
        '@angular/core/testing': { TestBed: 'Testbed', async: 'async' }
    };
    if (useMasterServiceStub) {
        const provider = 'MasterService';
        getDependency(helpers_1.getStubFileName(provider), helpers_1.getStubName(provider));
    }
    else {
        constructorParams.forEach(param => {
            const provider = param.type.typeName.text;
            getDependency(helpers_1.getStubFileName(provider), helpers_1.getStubName(provider));
        });
    }
    getDependency(sourceFile.fileName, classNode.name.text);
    addDependency(providerDependencies_1.getProviderDependencies(constructorParams, sourceFile));
    return dependencyObj;
}
exports.default = getDependancyObj;
