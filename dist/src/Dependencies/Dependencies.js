"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pathHelpers_1 = require("./pathHelpers");
const helpers_1 = require("../shared/helpers");
class Dependencies {
    constructor(sourceFile, classNode, constructorParams, useMasterServiceStub) {
        this.sourceFile = sourceFile;
        this.useMasterServiceStub = useMasterServiceStub;
        this.constructorParams = constructorParams;
        this.dependencyObj = {
            paths: {
                '@angular/core/testing': ['TestBed', 'async'],
                [`./${pathHelpers_1.removePathExtension(sourceFile.fileName)}`]: [classNode.name.text]
            },
            names: {
                TestBed: true,
                async: true,
                [classNode.name.text]: true
            }
        };
    }
    addDependency(name, path) {
        if (path) {
            if (!this.dependencyObj.paths.hasOwnProperty(path)) {
                this.dependencyObj.paths[path] = [name];
            }
            else {
                this.dependencyObj.paths[path].push(name);
            }
        }
        this.dependencyObj.names[name] = true;
    }
    buildMasterServiceDependancyObj() {
        const masterStubName = 'MasterServiceStub';
        let stubPath = pathHelpers_1.findRelativeStubPath(masterStubName);
        if (stubPath) {
            this.addDependency(masterStubName, stubPath);
        }
        this.constructorParams.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = helpers_1.getStubName(provider);
            this.addDependency(provider, pathHelpers_1.findProviderPath(this.sourceFile, provider));
            if (pathHelpers_1.findRelativeStubPath(stubName)) {
                this.addDependency(stubName);
            }
        });
    }
    buildNonMasterServiceDependancyObj() {
        this.constructorParams.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = helpers_1.getStubName(provider);
            this.addDependency(provider, pathHelpers_1.findProviderPath(this.sourceFile, provider));
            const stubPath = pathHelpers_1.findRelativeStubPath(stubName);
            if (stubPath) {
                this.addDependency(stubName, stubPath);
            }
        });
    }
    getDependancyObj() {
        if (this.useMasterServiceStub) {
            this.buildMasterServiceDependancyObj();
        }
        else {
            this.buildNonMasterServiceDependancyObj();
        }
        return this.dependencyObj;
    }
}
exports.default = Dependencies;
