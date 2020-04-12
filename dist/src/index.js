#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../polyfills");
const typescript_1 = __importDefault(require("typescript"));
const fs_1 = __importDefault(require("fs"));
const prettier_1 = __importDefault(require("prettier"));
const yargs_1 = __importDefault(require("yargs"));
const ComponentSpecBuilder_1 = require("./component/ComponentSpecBuilder");
const ServiceSpecBuilder_1 = require("./service/ServiceSpecBuilder");
const terminal = yargs_1.default.usage('Usage: $0 <command> [options]')
    .command('build', 'Build test file')
    .example('$0 build -f app.component.ts', 'build test file for app.component.ts')
    .option('f', {
    alias: 'file',
    demandOption: true,
    nargs: 1,
    describe: 'Load a File',
    type: 'string'
})
    .option('m', {
    alias: 'master',
    demandOption: false,
    nargs: 0,
    describe: 'Use MasterServiceStub',
})
    .help('h')
    .alias('h', 'help').argv;
function writeFile(fileName, data) {
    fs_1.default.writeFile(fileName, prettier_1.default.format(data, { parser: 'babel' }), (err) => {
        console.error('ERROR', err);
    });
}
const useMasterServiceStub = terminal.master;
const specFileName = terminal.file.split('.').slice(0, -1).join('.') + '.spec.ts';
const specPath = `${process.cwd()}/${specFileName}`;
if (!fs_1.default.existsSync(specPath)) {
    const split = terminal.file.split('.');
    const fileType = split[split.length - 2];
    let created;
    switch (fileType) {
        case 'component':
            created = new ComponentSpecBuilder_1.ComponentSpecBuilder(terminal.file, specFileName, useMasterServiceStub).targetFile;
            break;
        case 'service':
            created = new ServiceSpecBuilder_1.ServiceSpecBuilder(terminal.file, specFileName, useMasterServiceStub).targetFile;
            break;
        case 'resource':
            console.log('TO DO');
            break;
    }
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    writeFile(specFileName, printer.printFile(created));
}
