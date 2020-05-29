import SpecFileCreate from './SpecFileCreate';
import SpecFileUpdate from './SpecFileUpdate';
import esformatter from 'esformatter';
import prettier from 'prettier';
import ts, { SourceFile, Printer, updateSourceFile } from 'typescript';
import fs from 'fs';

function formatFile(content: SourceFile): string {
  const printer: Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const esFormatted = esformatter.format(printer.printFile(content), {
    lineBreak: {
      "before": {
        "CallExpression": 2,
      }
    },
  });

  return prettier.format(esFormatted, { parser: 'babel' });
}

function writeFile(content: SourceFile, targetFileName: string, successCb: Function): void {
  const formattedFile = formatFile(content);
  fs.writeFile(targetFileName, formattedFile, (err) => {
    if (err) {
      return console.error(err);
    }

    successCb();
  });
}

function buildTargetFile(targetFileName: string, sourceFile: SourceFile, masterOptionUsed: boolean) {
  const targetFile = ts.createSourceFile(targetFileName, "", ts.ScriptTarget.Latest, false);
  const created = new SpecFileCreate(sourceFile, targetFile, masterOptionUsed).build();
  writeFile(created, targetFileName, () => {
    console.log(`Success! ${targetFileName} has been built.`);
  });
}

function updateTargetFile(targetFileName: string, sourceFile: SourceFile, masterOptionUsed: boolean) {
  const targetFile = ts.createSourceFile(targetFileName, fs.readFileSync(`${process.cwd()}/${targetFileName}`, 'utf8'), ts.ScriptTarget.Latest, false);
  const updated = new SpecFileUpdate(sourceFile, targetFile, masterOptionUsed).update();
  writeFile(updated, targetFileName, () => {
    console.log(`Success! ${targetFileName} has been updated.`);
  });
}

function startApplication(buildCommandUsed: boolean, masterOptionUsed: boolean, sourceFileName: string, targetFileName: string): void {
  const sourceFile = ts.createSourceFile(sourceFileName, fs.readFileSync(`${process.cwd()}/${sourceFileName}`, 'utf8'), ts.ScriptTarget.Latest);

  if (buildCommandUsed) {
    buildTargetFile(targetFileName, sourceFile, masterOptionUsed);
  } else {
    updateTargetFile(targetFileName, sourceFile, masterOptionUsed);
  }
}

export default startApplication;

