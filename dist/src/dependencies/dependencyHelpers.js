"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const regex_1 = require("../shared/regex");
function getDependencyPathAndExports(fileName, name) {
    const currentDirectory = process.cwd();
    const dependencyPath = searchFileSystem(fileName, path_1.default.dirname(currentDirectory));
    if (dependencyPath) {
        const content = fs_1.default.readFileSync(dependencyPath + '.ts', 'utf8');
        let relativePath = path_1.default.relative(currentDirectory, dependencyPath);
        if (currentDirectory === path_1.default.dirname(dependencyPath)) {
            relativePath = `./${relativePath}`;
        }
        if (!regex_1.isExportDefault.test(content)) {
            return { [relativePath]: { [name]: name } };
        }
        else {
            return { [relativePath]: { default: name } };
        }
    }
}
exports.getDependencyPathAndExports = getDependencyPathAndExports;
function searchFileSystem(stubName, currentPath) {
    // Will I need to add more exluded directories? Which ones?
    const excludedDirectories = {
        node_modules: true,
        dist: true,
        '.git': true
    };
    let fileFound;
    const inner = (currentPath) => {
        if (!fileFound) {
            const files = fs_1.default.readdirSync(currentPath);
            for (const file in files) {
                const currentFile = currentPath + '/' + files[file];
                const stats = fs_1.default.statSync(currentFile);
                if (stats.isFile() && path_1.default.basename(currentFile).toLowerCase() === stubName.toLowerCase()) {
                    fileFound = removePathExtension(currentFile);
                }
                else if (stats.isDirectory() && !excludedDirectories.hasOwnProperty(path_1.default.basename(currentPath))) {
                    inner(currentFile);
                }
            }
        }
    };
    inner(currentPath);
    return fileFound;
}
function removePathExtension(path) {
    return path.slice(0, -3);
}
