const ts = require('typescript');
const { getDescribe, getImport, getConfiguration } = require('./templates');

function createSpecFile(parentNode, sourceFile) {
  sourceFile.statements = [getImport(['TestBed', 'async'], '@angular/core/testing')];
  return createDescribes(parentNode, sourceFile);
}

function createDescribes(parentNode, sourceFile) {
  ts.forEachChild(parentNode, childNode => {
    if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
      sourceFile.statements = [...sourceFile.statements, getDescribe(childNode.name.escapedText)];
    }

    if (ts.isClassDeclaration(childNode)) {
      const body = sourceFile.statements[sourceFile.statements.length - 1].parameters[1].body;
      body.statements = ts.createNodeArray([getConfiguration()]);
      createDescribes(childNode, body);
    }
  });
  return sourceFile;
}


exports.createSpecFile = createSpecFile;



// function sourceFileContains(parentNode, componentNode) {
//   console.log('SOURCE FILE', sourceFile);

//   ts.forEachChild(parentNode, childNode => {
//     console.log('CHILD NODE', childNode);
//   });
//   for (let obj of componentDescribe.arguments[1].body.statements) {
//     if (obj.expression && obj.expression.expression && obj.expression.expression.escapedText === 'describe') {
//       if (node.name.escapedText === obj.expression.arguments[0].text) {
//         return true;
//       }
//     }
//   }

//   ts.forEachChild(parentNode, childNode => {
//     console.log(childNode);
//   });

//   return true;
// }

// function updateSpecFile(componentFile, specFile, specFileName) {
//   const classDeclaration = getComponentDeclaration(componentFile.statements);
//   const componentDescribe = getComponentDescribe(specFile.statements);
//   let updatedFile;
//   let index = 1;
//   ts.forEachChild(classDeclaration, child => {
//     if (ts.isMethodDeclaration(child) && !sourceFileContains(sourceFile, child)) {
//       const newDescribe = ts.createSourceFile(
//         specFileName,   // fileName
//         getDescribe(child.name.escapedText, ''), // sourceText
//         ts.ScriptTarget.Latest // langugeVersion
//       );
//       const states = componentDescribe.arguments[1].body.statements;
//       updatedFile = componentDescribe.arguments[1].body.statements = ts.createNodeArray(
//         [...states.slice(0, index), newDescribe.statements[0], ...states.slice(index)]
//       );
//     }

//     if (ts.isMethodDeclaration(child)) {
//       index++;
//     }

//   });
//   const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
//   writeFile(specFileName, printer.printFile(specFile));
// }

// function updateSpecFile(parentNode, sourceFile) {
//   ts.forEachChild(parentNode, childNode => {
//     if ((ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) && !sourceFileContains(sourceFile, childNode)) {
//       sourceFile.statements = [...sourceFile.statements, getDescribe(childNode.name.escapedText)];
//     }

//     if (ts.isClassDeclaration(childNode)) {
//       updateSpecFile(childNode, sourceFile);
//     }
//   });

//   return sourceFile;
// }

