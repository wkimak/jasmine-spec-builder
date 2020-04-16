"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = __importDefault(require("typescript"));
const pathHelpers_1 = require("./pathHelpers");
class ImportsBuilder {
    constructor(sourceFile, classNode, constructorParams, useMasterServiceStub) {
        this.sourceFile = sourceFile;
        this.constructorParams = constructorParams;
        this.importsObj = {
            '@angular/core/testing': ['TestBed', 'async'],
            [`./${pathHelpers_1.removePathExtension(sourceFile.fileName)}`]: [classNode.name.text],
        };
        if (useMasterServiceStub) {
            this.buildMasterServiceImportsObj();
        }
        else {
            this.buildNonMasterServiceImportsObj();
        }
    }
    addImport(path, name) {
        if (!this.importsObj.hasOwnProperty(path)) {
            this.importsObj[path] = [name];
        }
        else {
            this.importsObj[path].push(name);
        }
    }
    buildMasterServiceImportsObj() {
        const stubName = 'MasterServiceStub';
        const stubPath = pathHelpers_1.findRelativeStubPath(stubName);
        if (stubPath) {
            this.addImport(stubPath, stubName);
        }
        this.constructorParams.forEach((param) => {
            const provider = param.type.typeName.text;
            this.addImport(pathHelpers_1.findProviderPath(this.sourceFile, provider), provider);
        });
    }
    buildNonMasterServiceImportsObj() {
        this.constructorParams.forEach((param) => {
            const provider = param.type.typeName.text;
            const stubName = provider + 'Stub';
            this.addImport(pathHelpers_1.findProviderPath(this.sourceFile, provider), provider);
            const stubPath = pathHelpers_1.findRelativeStubPath(stubName);
            if (stubPath) {
                this.addImport(stubPath, stubName);
            }
        });
    }
    getImportsTemplate() {
        const result = [];
        for (const path in this.importsObj) {
            result.push(typescript_1.default.createImportDeclaration(undefined, undefined, typescript_1.default.createImportClause(typescript_1.default.createObjectLiteral(this.importsObj[path].map((x) => typescript_1.default.createIdentifier(x))), undefined), typescript_1.default.createLiteral(path)));
        }
        return result;
    }
}
exports.default = ImportsBuilder;
