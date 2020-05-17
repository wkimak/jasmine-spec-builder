"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getStubFileName(provider) {
    return provider + 'Stub.ts';
}
exports.getStubFileName = getStubFileName;
function getStubName(provider) {
    return provider + 'Stub';
}
exports.getStubName = getStubName;
function removePathExtension(path) {
    return path.slice(0, -3);
}
exports.removePathExtension = removePathExtension;
