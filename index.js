#!/usr/bin/env node
const fs = require('fs');
const prettier = require('prettier');
const ts = require('typescript');
const argv = require('yargs');
const { createSpecFile } = require('./buildSpecFile');

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

function writeFile(fileName, data) {
  fs.writeFile(fileName, prettier.format(data, { parser: 'babel' }), (err) => {
    console.error('ERROR', err);
  });
}

const specFileName = terminal.file.split('.').slice(0, -1).join('.') + '.spec.ts';
const specPath = `${process.cwd()}/${specFileName}`;

if (!fs.existsSync(specPath)) {
  const componentFile = ts.createSourceFile(
    terminal.file,
    fs.readFileSync(`${process.cwd()}/${terminal.file}`, 'utf8'),
    ts.ScriptTarget.Latest
  );
  const sourceFile = ts.createSourceFile(specFileName, "", ts.ScriptTarget.Latest, false);
  const created = createSpecFile(componentFile, sourceFile);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  writeFile(specFileName, printer.printFile(created));
}










