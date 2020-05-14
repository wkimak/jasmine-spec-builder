"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../shared/helpers");
const dependencyHelpers_1 = require("./dependencyHelpers");
function getStubDependencies(promises, dependencyObj, constructorParams) {
    constructorParams.forEach((param) => {
        const provider = param.type.typeName.text;
        const stubName = helpers_1.getStubFileName(provider);
        promises.push(dependencyHelpers_1.getDependency(stubName).then(obj => {
            if (obj) {
                dependencyHelpers_1.addDependency(dependencyObj, obj);
            }
        }));
    });
}
exports.getStubDependencies = getStubDependencies;
