#!/usr/bin/env node
import '../polyfills'
import ts, { SourceFile, Printer } from 'typescript';
import fs from 'fs';
import prettier from 'prettier';
import argv from 'yargs';
import { ComponentSpecBuilder } from './component/ComponentSpecBuilder';
import { ServiceSpecBuilder } from './service/ServiceSpecBuilder';

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


function writeFile(fileName: string, data: string): void {
  fs.writeFile(fileName, prettier.format(data, { parser: 'babel' }), (err) => {
    console.error('ERROR', err);
  });
}

const useMasterServiceStub: boolean = terminal.master;
const specFileName: string = terminal.file.split('.').slice(0, -1).join('.') + '.spec.ts';
const specPath: string = `${process.cwd()}/${specFileName}`;

if (!fs.existsSync(specPath)) {
  const split: string[] = terminal.file.split('.');
  const fileType: string = split[split.length - 2];
  let created: SourceFile;
  switch(fileType) {
    case 'component':
      created = new ComponentSpecBuilder(terminal.file, specFileName, useMasterServiceStub).targetFile;
      break;
    case 'service':
      created = new ServiceSpecBuilder(terminal.file, specFileName, useMasterServiceStub).targetFile;
      break;
    case 'resource':
      console.log('TO DO');
      break;
  }
  const printer: Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  writeFile(specFileName, printer.printFile(created));
}

