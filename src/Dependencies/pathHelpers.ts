import fs from 'fs';
import path from 'path';
import ts, { ImportSpecifier, NamedImports, StringLiteral, SourceFile } from 'typescript';

// Need to take into account different file extensions
export function removePathExtension(path: string): string {
    return path.slice(0, -3);
}

export function findRelativeStubPath(stubName: string): string {
    const specPath = process.cwd();
    const stubPath = searchFileSystem(stubName, path.dirname(specPath));
    return stubPath && path.relative(specPath, stubPath);
}

export function findProviderPath(sourceFile: SourceFile, provider: string): string {
    for (const childNode of sourceFile.statements) {
        if (ts.isImportDeclaration(childNode)) {
            const imports: ts.NodeArray<ImportSpecifier> = (<NamedImports>childNode.importClause.namedBindings).elements;
            const path: string = (<StringLiteral>childNode.moduleSpecifier).text;
            for (const node of imports) {
                if (node.name.text === provider) {
                    return path;
                }
            }
        }
    }
}

export function searchFileSystem(stubName: string, currentPath: string): string {
    // Will I need to add more exluded directories? Which ones?
    const excludedDirectories = {
        node_modules: true,
        dist: true,
        '.git': true
    };
    let fileFound: string;
    const inner = (currentPath: string) => {
        if (!fileFound) {
            const files: string[] = fs.readdirSync(currentPath);

            for (const file in files) {
                const currentFile: string = currentPath + '/' + files[file];
                const stats: fs.Stats = fs.statSync(currentFile);
                if (stats.isFile() && path.basename(currentFile).toLowerCase() === stubName.toLowerCase() + '.ts') {
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

