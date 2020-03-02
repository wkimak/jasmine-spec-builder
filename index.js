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

function recurse(node, result) {
    node.statements.filter(x => ts.SyntaxKind[x.kind] === 'FunctionDeclaration').forEach((child, index) => {
            result.push({ name: child.name.escapedText, children: []});
             if (child.body.statements) {
                 recurse(child.body, result[index].children);
             };
    });

    return result;
}

console.log(recurse(node, []));


