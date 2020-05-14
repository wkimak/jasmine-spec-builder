#!/usr/bin/env node
import '../polyfills'
import ts, { SourceFile, Printer } from 'typescript';
import fs from 'fs';
import prettier from 'prettier';
import argv from 'yargs';
import SpecFileCreate from './SpecFileCreate';
import SpecFileUpdate from './SpecFileUpdate';

const terminal = argv.usage('Usage: $0 <command> [options]')
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
const specFileName: string = `${terminal.file.split('.').slice(0, -1).join('.')}.spec.ts`;
const specPath: string = `${process.cwd()}/${specFileName}`;
const sourceFile = ts.createSourceFile(terminal.file, fs.readFileSync(`${process.cwd()}/${terminal.file}`, 'utf8'), ts.ScriptTarget.Latest);
const printer: Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

function writeFile(data: SourceFile) {
  fs.writeFile(specFileName, prettier.format(printer.printFile(data), { parser: 'babel' }), (err) => {
    console.error('ERROR', err);
  });
}

if (commandUsed === 'build') {
  if (!fs.existsSync(specPath)) {
    const targetFile = ts.createSourceFile(specFileName, "", ts.ScriptTarget.Latest, false);
    const created = new SpecFileCreate(sourceFile, terminal.master).build(targetFile);
    writeFile(created);
  }
} else if (commandUsed === 'update') {
  if (fs.existsSync(specPath)) {
    const targetFile = ts.createSourceFile(specFileName, fs.readFileSync(`${process.cwd()}/${specFileName}`, 'utf8'), ts.ScriptTarget.Latest, false);
    const updated = new SpecFileUpdate(sourceFile, terminal.master).update(targetFile);
    writeFile(updated);
  }
}
