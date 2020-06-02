#!/usr/bin/env node
import '../polyfills'
import fs from 'fs';
import argv from 'yargs';
import { searchFileSystem, findRootDirectory } from './dependencies/stubDependencies';
import { isComponentFile, isServiceFile, isResourceFile } from './shared/regex';
import startApplication from './writeFile';

let buildCommandUsed: boolean;
let masterOptionUsed: boolean;
let sourceFileName: string;
let targetFileName: string;

function checkFileOption(argv): boolean {
  sourceFileName = argv.file;
  buildCommandUsed = argv._[0] === 'build';
  targetFileName = `${sourceFileName.split('.').slice(0, -1).join('.')}.spec.ts`;

  if (!isComponentFile.test(sourceFileName) && !isServiceFile.test(sourceFileName) && !isResourceFile.test(sourceFileName)) {
    throw new Error(`Invalid file name: ${sourceFileName}. The source file name must have an extension of .component, .service , or .resource (e.g. app.component.ts, app.service.ts, app.resource.ts).`);
  } else if (buildCommandUsed && fs.existsSync(targetFileName)) {
    throw new Error(`${targetFileName} file already exists. Use the update command to update a spec file’s providers.`);
  } else if (!buildCommandUsed && !fs.existsSync(targetFileName)) {
    throw new Error(`${targetFileName} file does not exist. Use the build command to build a spec file from scratch.`);
  }

  return true;
}

function checkMasterOption(argv): boolean {
  masterOptionUsed = argv.master;

  if (masterOptionUsed) {
    const rootDirectory = findRootDirectory(process.cwd());
    const masterFilePath = searchFileSystem('MasterServiceStub.ts', rootDirectory);
    if (!masterFilePath) {
      throw new Error('MasterServiceStub.ts file not found. The MasterServiceStub’s file must be named MasterServiceStub.ts.');
    }
  }

  return true;
}

argv.command('build', 'Build a non-existing spec file')
  .example('$0 build -f app.component.ts')
  .command('update', 'Update an existing spec file\'s providers')
  .example('$0 update -f app.component.ts')
  .option('f', {
    alias: 'file',
    demandOption: true,
    nargs: 1,
    describe: 'Load specified file',
    type: 'string',
    global: true
  })
  .check((argv) => {
    return checkFileOption(argv);
  })
  .demandCommand(1, 'You need at least one command before moving on')
  .option('m', {
    alias: 'master',
    demandOption: false,
    nargs: 0,
    describe: 'Configure spec file to use a MasterServiceStub (master class to hold instances of all service stubs). This can be a good approach to ensure new instances of every service stub before each test.',
    global: true
  })
  .check((argv) => {
    return checkMasterOption(argv);
  })
  .example('$0 build -f app.component.ts -m')
  .example('$0 update -f app.component.ts -m')
  .help('h')
  .alias('h', 'help').argv;


startApplication(buildCommandUsed, masterOptionUsed, sourceFileName, targetFileName);
