"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SpecFileCreate_1 = __importDefault(require("./SpecFileCreate"));
const SpecFileUpdate_1 = __importDefault(require("./SpecFileUpdate"));
const esformatter_1 = __importDefault(require("esformatter"));
const prettier_1 = __importDefault(require("prettier"));
const typescript_1 = __importDefault(require("typescript"));
const fs_1 = __importDefault(require("fs"));
function formatFile(content) {
    const printer = typescript_1.default.createPrinter({ newLine: typescript_1.default.NewLineKind.LineFeed });
    const esFormatted = esformatter_1.default.format(printer.printFile(content), {
        lineBreak: {
            "before": {
                "CallExpression": 2,
            }
        },
    });
    return prettier_1.default.format(esFormatted, { parser: 'babel', singleQuote: true });
}
function writeFile(content, targetFileName, successCb) {
    const formattedFile = formatFile(content);
    fs_1.default.writeFile(targetFileName, formattedFile, (err) => {
        if (err) {
            return console.error(err);
        }
        successCb();
    });
}
function buildTargetFile(targetFileName, sourceFile, masterOptionUsed) {
    const targetFile = typescript_1.default.createSourceFile(targetFileName, "", typescript_1.default.ScriptTarget.Latest, false);
    const created = new SpecFileCreate_1.default(sourceFile, targetFile, masterOptionUsed).build();
    writeFile(created, targetFileName, () => {
        console.log(`Success! ${targetFileName} has been built.`);
    });
}
function updateTargetFile(targetFileName, sourceFile, masterOptionUsed) {
    const targetFile = typescript_1.default.createSourceFile(targetFileName, fs_1.default.readFileSync(`${process.cwd()}/${targetFileName}`, 'utf8'), typescript_1.default.ScriptTarget.Latest, false);
    const updated = new SpecFileUpdate_1.default(sourceFile, targetFile, masterOptionUsed).update();
    writeFile(updated, targetFileName, () => {
        console.log(`Success! ${targetFileName} has been updated.`);
    });
}
function startApplication(buildCommandUsed, masterOptionUsed, sourceFileName, targetFileName) {
    const sourceFile = typescript_1.default.createSourceFile(sourceFileName, fs_1.default.readFileSync(`${process.cwd()}/${sourceFileName}`, 'utf8'), typescript_1.default.ScriptTarget.Latest);
    if (buildCommandUsed) {
        buildTargetFile(targetFileName, sourceFile, masterOptionUsed);
    }
    else {
        updateTargetFile(targetFileName, sourceFile, masterOptionUsed);
    }
}
exports.default = startApplication;
