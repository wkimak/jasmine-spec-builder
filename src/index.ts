#!/usr/bin/env node
import '../polyfills'
import ts, { SourceFile, Printer } from 'typescript';
import fs from 'fs';
import prettier from 'prettier';
import argv from 'yargs';
import createSpecFile from './buildSpecFile';

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
  .help('h')
  .alias('h', 'help').argv;

function writeFile(fileName, data): void {
  fs.writeFile(fileName, prettier.format(data, { parser: 'babel' }), (err) => {
    console.error('ERROR', err);
  });
}

const specFileName: string = terminal.file.split('.').slice(0, -1).join('.') + '.spec.ts';
const specPath: string = `${process.cwd()}/${specFileName}`;

if (!fs.existsSync(specPath)) {
  const componentFile: SourceFile = ts.createSourceFile(
    terminal.file,
    fs.readFileSync(`${process.cwd()}/${terminal.file}`, 'utf8'),
    ts.ScriptTarget.Latest
  );
  const sourceFile: SourceFile = ts.createSourceFile(specFileName, "", ts.ScriptTarget.Latest, false);
  const created: SourceFile = createSpecFile(componentFile, sourceFile);
  const printer: Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  writeFile(specFileName, printer.printFile(created));
}

