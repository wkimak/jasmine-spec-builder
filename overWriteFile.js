const { imports, getDescribe, getConfiguration, buildDescribes } = require('./templates');
const ts = require('typescript');

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

function overWriteFile(nodes) {
  let output = imports.join(''), nextNodes = nodes;
  for(let child of nodes) {
    if(ts.SyntaxKind[child.kind] === 'ClassDeclaration' && isComponentClass(child)) {
        output += getDescribe(child.name.escapedText, getConfiguration());
        nextNodes = child.members;
        break;
    }
  }
  return buildDescribes(nextNodes, output);
}

exports.overWriteFile = overWriteFile;