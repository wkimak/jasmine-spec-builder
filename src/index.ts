#!/usr/bin/env node
import '../polyfills'
import ts, { SourceFile, Printer } from 'typescript';
import fs from 'fs';
import prettier from 'prettier';
import argv from 'yargs';
import SpecFileBuilder from './SpecFileBuilder';

const terminal = argv.usage('Usage: $0 <command> [options]')
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


const specFileName: string = terminal.file.split('.').slice(0, -1).join('.') + '.spec.ts';
const specPath: string = `${process.cwd()}/${specFileName}`;

if (!fs.existsSync(specPath)) {
  const sourceFile = ts.createSourceFile(terminal.file, fs.readFileSync(`${process.cwd()}/${terminal.file}`, 'utf8'), ts.ScriptTarget.Latest);
  const targetFile = ts.createSourceFile(specFileName, "", ts.ScriptTarget.Latest, false);
  const created: SourceFile = new SpecFileBuilder(sourceFile, terminal.master).build(targetFile);
  const printer: Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  fs.writeFile(specFileName, prettier.format(printer.printFile(created), { parser: 'babel' }), (err) => {
    console.error('ERROR', err);
  });
}

