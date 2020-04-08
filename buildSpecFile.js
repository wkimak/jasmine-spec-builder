const ts = require('typescript');
const fs = require('fs');
const path = require('path')
const { getDescribe, getImport, getConfiguration } = require('./templates');

function prependImport(sourceFile, names, path) {
  sourceFile.statements = [getImport(names, path), ...sourceFile.statements];
}

function removePathExtension(path) {
  return path.slice(0, -3);
}

function createSpecFile(componentFile, sourceFile) {
  ts.forEachChild(componentFile, childNode => {
    if (ts.isClassDeclaration(childNode) || ts.isFunctionDeclaration(childNode) || ts.isMethodDeclaration(childNode)) {
      sourceFile.statements = [...sourceFile.statements, getDescribe(childNode.name.escapedText)];
    }

    if (ts.isClassDeclaration(childNode)) {
      const className = childNode.name.escapedText;
      const body = sourceFile.statements[sourceFile.statements.length - 1].parameters[1].body;
      const stubs = createStubs(componentFile, childNode, sourceFile);
      body.statements = ts.createNodeArray([getConfiguration(stubs, className)]);
      prependImport(sourceFile, ['TestBed', 'async'], '@angular/core/testing');
      prependImport(sourceFile, [className], `./${removePathExtension(componentFile.fileName)}`);
      createSpecFile(childNode, body);
    }
  });
  return sourceFile;
}

function findStubPath(stubName, currentPath) {
  const excludedDirectories = {
    node_modules: true,
    dist: true,
    '.git': true
  };
  let fileFound = false;

  function inner(currentPath) {
    if (!fileFound) {
      const files = fs.readdirSync(currentPath);

      for (const file in files) {
        var currentFile = currentPath + '/' + files[file];
        var stats = fs.statSync(currentFile);
        if (stats.isFile() && path.basename(currentFile) === stubName + '.ts') {
          fileFound = removePathExtension(currentFile);
        }
        else if (stats.isDirectory() && !excludedDirectories.hasOwnProperty(path.basename(currentPath))) {
          inner(currentFile);
        }
      }
    }
  }

  inner(currentPath);
  return fileFound;
}

function findImportForDI(sourceFile, componentFile, provider) {
  for (const childNode of componentFile.statements) {
    if (ts.isImportDeclaration(childNode)) {
      const imports = childNode.importClause.namedBindings.elements;
      const path = childNode.moduleSpecifier.text;
      imports.forEach(node => {
        if (node.name.escapedText === provider) {
          prependImport(sourceFile, [provider], path);
        }
      });
    }
  }
}

function createRelativeStubPath(stubName, sourceFile) {
  const specPath = process.cwd();
  const stubPath = findStubPath(stubName, path.dirname(specPath));
  const relativePath = path.relative(specPath, stubPath);
  prependImport(sourceFile, [stubName], relativePath);
}

function createStubs(componentFile, classNode, sourceFile) {
  const stubs = [];
  for (const childNode of classNode.members) {
    if (ts.isConstructorDeclaration(childNode)) {
      childNode.parameters.forEach(param => {
        const provider = param.type.typeName.escapedText;
        const stubName = provider + 'Stub';
        stubs.push({ provider, class: stubName });
        createRelativeStubPath(stubName, sourceFile);
        findImportForDI(sourceFile, componentFile, provider);
      });
      return stubs;
    }
  };

  return stubs;
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

