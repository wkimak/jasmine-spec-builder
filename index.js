#!/usr/bin/env node
const fs = require('fs');
const ts = require('typescript');
const fileName = process.argv[2];
const cwd = process.cwd;


const node = ts.createSourceFile(
    fileName,   // fileName
    fs.readFileSync(`${cwd()}/${fileName}`, 'utf8'), // sourceText
    ts.ScriptTarget.Latest // langugeVersion
);

function getDescribe(fileName, ) {
  return `describe((${fileName}) => {}) \n`
}

let output = '';
function scanFile(node, result, index) {
    node.forEach((child) => {
        if (ts.SyntaxKind[child.kind] === 'ClassDeclaration') {
            result.push({ name: child.name.escapedText, children: []});
            output += getDescribe(child.name.escapedText);
            if  (child.members) {
              scanFile(child.members, result[index].children, index++);
            }
        } else if (ts.SyntaxKind[child.kind] === 'FunctionDeclaration' || ts.SyntaxKind[child.kind] === 'MethodDeclaration' ) {
            result.push({ name: child.name.escapedText, children: []});
            output += getDescribe(child.name.escapedText);
             if (child.body.statements) {
                 scanFile(child.body.statements, result[index].children, index++);
             };
        }
    });

    return result;
}

scanFile(node.statements, [], 0);
console.log('OUTPUT', output);

// fs.writeFile(`${fileName.split('.')[0]}.test.ts`, JSON.stringify(scanFile(node.statements, [], 0)), (err) => {
//     console.error('ERROR', err);
// });

 //console.log(scanFile(node.statements, [], 0));



