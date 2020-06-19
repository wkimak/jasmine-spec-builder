"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const providerDependencies_1 = __importDefault(require("./providerDependencies"));
const stubDependencies_1 = __importStar(require("./stubDependencies"));
const helpers_1 = require("../shared/helpers");
let dependencyObj = {
    pathsForImports: {},
    dependencyNamesForProviders: {}
};
function addDependencyPathForImports(obj) {
    dependencyObj.pathsForImports = Object.assign(Object.assign({}, dependencyObj.pathsForImports), obj);
}
function addDependencyForProviders(obj) {
    dependencyObj.dependencyNamesForProviders = Object.assign(Object.assign({}, dependencyObj.dependencyNamesForProviders), obj);
}
function getDependency(fileName, stubName, addToImports) {
    const currentDirectory = process.cwd();
    const projectRootDirectory = stubDependencies_1.findRootDirectory(currentDirectory);
    const obj = stubDependencies_1.default(fileName, stubName, currentDirectory, projectRootDirectory);
    if (obj) {
        if (addToImports) {
            addDependencyPathForImports(obj);
        }
        addDependencyForProviders({ [stubName]: true });
    }
}
;
function setTestingPathDependencies(isComponent) {
    const path = '@angular/core/testing';
    dependencyObj.pathsForImports[path] = { TestBed: 'TestBed', async: 'async' };
    if (isComponent) {
        dependencyObj.pathsForImports[path] = Object.assign(Object.assign({}, dependencyObj.pathsForImports[path]), { ComponentFixture: 'ComponentFixture' });
    }
}
function getDependancyObj(isComponent, sourceFile, classNode, constructorParams, useMasterServiceStub) {
    setTestingPathDependencies(isComponent);
    let provider;
    if (useMasterServiceStub) {
        provider = 'MasterService';
        getDependency(helpers_1.getStubFileName(provider), helpers_1.getStubName(provider), true);
    }
    constructorParams.forEach((param) => {
        const typeName = param.type.typeName;
        if (typeName) {
            const provider = typeName.text;
            getDependency(helpers_1.getStubFileName(provider), helpers_1.getStubName(provider), !useMasterServiceStub);
        }
    });
    getDependency(sourceFile.fileName, classNode.name.text, true);
    addDependencyPathForImports(providerDependencies_1.default(constructorParams, sourceFile));
    return dependencyObj;
}
exports.default = getDependancyObj;
