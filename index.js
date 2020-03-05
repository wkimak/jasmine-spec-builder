#!/usr/bin/env node
const fs = require('fs');
const ts = require('typescript');
const prettier = require('prettier');
const argv = require('yargs');
const { overWriteFile } = require('./overWriteFile');
const { appendToFile } = require('./appendToFile');

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
  .option('a', {
    alias: 'append',
    demandOption: false,
    default: false,
    describe: 'Append to spec file',
    type: 'boolean'
  })
  .help('h')
  .alias('h', 'help').argv;

const node = ts.createSourceFile(
  terminal.file,   // fileName
  fs.readFileSync(`${process.cwd()}/${terminal.file}`, 'utf8'), // sourceText
  ts.ScriptTarget.Latest // langugeVersion
);

const prefix = terminal.file.split('.').slice(0, -1).join('.');
if (!terminal.append) {
  fs.writeFile(`${prefix}.spec.ts`, prettier.format(overWriteFile(node.statements), { parser: 'babel' }), (err) => {
    console.error('ERROR', err);
  });
} else {
  appendToFile();
}




