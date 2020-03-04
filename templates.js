const { getChildNodes } = require('./helpers');
const ts = require('typescript');

const imports = [
    `import { TestBed, async } from '@angular/core/testing';`,
];

function getConfiguration() {
    return `
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [],
        }).compileComponents();
      }));
    `
}

function buildDescribes(nodes, output) {
    nodes.forEach((child) => {
        if (ts.SyntaxKind[child.kind] === 'ClassDeclaration' ||
            ts.SyntaxKind[child.kind] === 'FunctionDeclaration' ||
            ts.SyntaxKind[child.kind] === 'MethodDeclaration') {
            output += getDescribe(child.name.escapedText, buildDescribes(getChildNodes(child), ''));
        }
    });

    return output;
}

function getDescribe(name, nestedDescribe) {
    return `describe(${JSON.stringify(name)}, () => {
        ${ nestedDescribe }
    });`;
}

exports.imports = imports;
exports.getConfiguration = getConfiguration;
exports.buildDescribes = buildDescribes;
exports.getDescribe = getDescribe;

