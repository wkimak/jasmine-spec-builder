#!/usr/bin/env node
const fs = require('fs');
const ts = require('typescript');
const prettier = require('prettier');
const fileName = process.argv[2];
const cwd = process.cwd;


const node = ts.createSourceFile(
    fileName,   // fileName
    fs.readFileSync(`${cwd()}/${fileName}`, 'utf8'), // sourceText
    ts.ScriptTarget.Latest // langugeVersion
);

function isComponentClass(node) {
    if (node.decorators) {
        for (const dec of node.decorators) {
            if (dec.expression.expression.escapedText === 'Component') {
                return true;
            }
        }
    }
    return false;
}

const imports = [
    `import { TestBed, async } from '@angular/core/testing';`,
]

function getConfiguration() {
    return `
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [],
        }).compileComponents();
      }));
    `
}

function scanFile(node, output) {
    node.forEach((child) => {
        if (ts.SyntaxKind[child.kind] === 'ClassDeclaration' ||
            ts.SyntaxKind[child.kind] === 'FunctionDeclaration' ||
            ts.SyntaxKind[child.kind] === 'MethodDeclaration') {
            output += `describe(${JSON.stringify(child.name.escapedText)}, () => {
                ${isComponentClass(child) ? getConfiguration() : ''}
                ${child.members ? scanFile(child.members, '') : scanFile(child.body && child.body.statements ? child.body.statements : [], '')}
            });`
        }
    });

    return output;
}

const prefix = fileName.split('.').slice(0, -1).join('.');
fs.writeFile(`${prefix}.spec.ts`, prettier.format(scanFile(node.statements, imports.join(''))), (err) => {
    console.error('ERROR', err);
});



