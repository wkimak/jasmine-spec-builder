"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const regex_1 = require("../shared/regex");
const helpers_1 = require("../shared/helpers");
const excludedDirectories = {
    node_modules: true,
    dist: true,
    '.git': true
};
function findRootDirectory(currentDirectory) {
    const files = fs_1.default.readdirSync(currentDirectory);
    for (let file in files) {
        if (files[file] === 'package.json') {
            return currentDirectory;
        }
    }
    return findRootDirectory(path_1.default.dirname(currentDirectory));
}
exports.findRootDirectory = findRootDirectory;
function getStubPathAndExport(targetFileName, stubName, currentDirectory, projectRootDirectory) {
    const dependencyPath = searchFileSystem(targetFileName, projectRootDirectory);
    if (dependencyPath) {
        const content = fs_1.default.readFileSync(dependencyPath, 'utf8');
        let relativePath = path_1.default.relative(currentDirectory, helpers_1.removePathExtension(dependencyPath));
        if (currentDirectory === path_1.default.dirname(dependencyPath)) {
            relativePath = `./${relativePath}`;
        }
        if (!regex_1.isExportDefault.test(content)) {
            return { [relativePath]: { [stubName]: stubName } };
        }
        else {
            return { [relativePath]: { default: stubName } };
        }
    }
}
function searchFileSystem(targetFileName, currentPath) {
    const files = fs_1.default.readdirSync(currentPath);
    for (const file in files) {
        const currentFile = currentPath + '/' + files[file];
        const stats = fs_1.default.statSync(currentFile);
        if (stats.isFile() && path_1.default.basename(currentFile).toLowerCase() === targetFileName.toLowerCase()) {
            return currentFile;
        }
        else if (stats.isDirectory() && !excludedDirectories.hasOwnProperty(path_1.default.basename(currentPath))) {
            const result = searchFileSystem(targetFileName, currentFile);
            if (result) {
                return result;
            }
        }
    }
}
exports.default = getStubPathAndExport;
