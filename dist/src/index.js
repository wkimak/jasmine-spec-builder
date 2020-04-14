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
const SpecFileBuilder_1 = __importDefault(require("./SpecFileBuilder"));
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
const specFileName = terminal.file.split('.').slice(0, -1).join('.') + '.spec.ts';
const specPath = `${process.cwd()}/${specFileName}`;
if (!fs_1.default.existsSync(specPath)) {
    const sourceFile = typescript_1.default.createSourceFile(terminal.file, fs_1.default.readFileSync(`${process.cwd()}/${terminal.file}`, 'utf8'), typescript_1.default.ScriptTarget.Latest);
    const targetFile = typescript_1.default.createSourceFile(specFileName, "", typescript_1.default.ScriptTarget.Latest, false);
    const created = new SpecFileBuilder_1.default(sourceFile, terminal.master).build(targetFile);
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    fs_1.default.writeFile(specFileName, prettier_1.default.format(printer.printFile(created), { parser: 'babel' }), (err) => {
        console.error('ERROR', err);
    });
}
