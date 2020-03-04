#!/usr/bin/env node
const fs = require('fs');
const ts = require('typescript');
const prettier = require('prettier');
const { overWriteFile } = require('./overWriteFile');
const fileName = process.argv[2];
const cwd = process.cwd;

// Index.js:
// 1.) taking in command from terminal
// 2.) get source file
// 3.) logic for choosing which actions to take
       // overwrite or not overwrite
// 4.) write file

// Templates.js
  // stores all basic text (imports, config, describes)

// OverwriteFile.js
  // functions to overwrite file 

// AppendToFile.js
  // function to append to file

// Helper.js
  // functions that are shared between OverwriteFile and AppendToFile

const node = ts.createSourceFile(
    fileName,   // fileName
    fs.readFileSync(`${cwd()}/${fileName}`, 'utf8'), // sourceText
    ts.ScriptTarget.Latest // langugeVersion
);

const overwrite = overWriteFile(node.statements);

const prefix = fileName.split('.').slice(0, -1).join('.');
fs.writeFile(`${prefix}.spec.ts`, prettier.format(overwrite), (err) => {
    console.error('ERROR', err);
});



