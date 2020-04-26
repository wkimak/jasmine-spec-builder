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
const SpecFileCreate_1 = __importDefault(require("./SpecFileCreate"));
const SpecFileUpdate_1 = __importDefault(require("./SpecFileUpdate"));
const terminal = yargs_1.default.usage('Usage: $0 <command> [options]')
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
    .option('m', {
    alias: 'master',
    demandOption: false,
    nargs: 0,
    describe: 'Use MasterServiceStub',
    global: true
})
    .help('h')
    .alias('h', 'help').argv;
const commandUsed = terminal._[0];
const specFileName = `${terminal.file.split('.').slice(0, -1).join('.')}.spec.ts`;
const specPath = `${process.cwd()}/${specFileName}`;
const sourceFile = typescript_1.default.createSourceFile(terminal.file, fs_1.default.readFileSync(`${process.cwd()}/${terminal.file}`, 'utf8'), typescript_1.default.ScriptTarget.Latest);
const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
function writeFile(data) {
    fs_1.default.writeFile(specFileName, prettier_1.default.format(printer.printFile(data), { parser: 'babel' }), (err) => {
        console.error('ERROR', err);
    });
}
if (commandUsed === 'build') {
    if (!fs_1.default.existsSync(specPath)) {
        const targetFile = typescript_1.default.createSourceFile(specFileName, "", typescript_1.default.ScriptTarget.Latest, false);
        const created = new SpecFileCreate_1.default(sourceFile, terminal.master).build(targetFile);
        writeFile(created);
    }
}
else if (commandUsed === 'update') {
    if (fs_1.default.existsSync(specPath)) {
        const targetFile = typescript_1.default.createSourceFile(specFileName, fs_1.default.readFileSync(`${process.cwd()}/${specFileName}`, 'utf8'), typescript_1.default.ScriptTarget.Latest, false);
        const updated = new SpecFileUpdate_1.default(sourceFile, terminal.master).update(targetFile);
        writeFile(updated);
    }
}
