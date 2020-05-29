#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../polyfills");
const fs_1 = __importDefault(require("fs"));
const yargs_1 = __importDefault(require("yargs"));
const stubDependencies_1 = require("./dependencies/stubDependencies");
const regex_1 = require("./shared/regex");
const writeFile_1 = __importDefault(require("./writeFile"));
let buildCommandUsed;
let masterOptionUsed;
let sourceFileName;
let targetFileName;
function checkFileOption(argv) {
    sourceFileName = argv.file;
    buildCommandUsed = argv._[0] === 'build';
    targetFileName = `${sourceFileName.split('.').slice(0, -1).join('.')}.spec.ts`;
    if (!regex_1.isComponentFile.test(sourceFileName) && !regex_1.isServiceFile.test(sourceFileName) && !regex_1.isResourceFile.test(sourceFileName)) {
        throw new Error(`Invalid file name: ${sourceFileName}. The file name must have an extension of component, service, or resource.`);
    }
    else if (buildCommandUsed && fs_1.default.existsSync(targetFileName)) {
        throw new Error(`${targetFileName} file already exists. Use the update command to update a spec file’s providers.`);
    }
    else if (!buildCommandUsed && !fs_1.default.existsSync(targetFileName)) {
        throw new Error(`${targetFileName} file does not exist. Use the build command to build a spec file from scratch.`);
    }
    return true;
}
function checkMasterOption(argv) {
    masterOptionUsed = argv.master;
    if (masterOptionUsed) {
        const rootDirectory = stubDependencies_1.findRootDirectory(process.cwd());
        const masterFilePath = stubDependencies_1.searchFileSystem('MasterServiceStub.ts', rootDirectory);
        if (!masterFilePath) {
            throw new Error('MasterServiceStub.ts file not found. The MasterServiceStub’s file must be named MasterServiceStub.ts');
        }
    }
    return true;
}
yargs_1.default.usage('Usage: $0 <command> [options]')
    .command('build', 'Build test file')
    .example('$0 build -f app.component.ts', 'build test file for app.component.ts')
    .command('update', 'Update providers')
    .example('$0 update -f app.component.ts', 'update providers configuration')
    .option('f', {
    alias: 'file',
    demandOption: true,
    nargs: 1,
    describe: 'Load a File',
    type: 'string',
    global: true
})
    .check((argv) => {
    return checkFileOption(argv);
})
    .option('m', {
    alias: 'master',
    demandOption: false,
    nargs: 0,
    describe: 'Use MasterServiceStub',
    global: true
})
    .check((argv) => {
    return checkMasterOption(argv);
})
    .help('h')
    .alias('h', 'help').argv;
writeFile_1.default(buildCommandUsed, masterOptionUsed, sourceFileName, targetFileName);
