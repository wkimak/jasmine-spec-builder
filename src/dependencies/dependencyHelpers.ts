import fs from 'fs';
import path from 'path';
import { isExportDefault } from '../shared/regex';


export function getDependencyPathAndExports(fileName: string, name: string): any {
  const currentDirectory = process.cwd();
  const dependencyPath = searchFileSystem(fileName, path.dirname(currentDirectory));
  if (dependencyPath) {
    const content = fs.readFileSync(dependencyPath + '.ts', 'utf8');
    let relativePath = path.relative(currentDirectory, dependencyPath);
    if (currentDirectory === path.dirname(dependencyPath)) {
      relativePath = `./${relativePath}`;
    }

    if (!isExportDefault.test(content)) {
      return { [relativePath]: { [name]: name } };
    } else {
      return { [relativePath]: { default: name } };
    }
  }
}

function searchFileSystem(stubName: string, currentPath: string): string {
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
        if (stats.isFile() && path.basename(currentFile).toLowerCase() === stubName.toLowerCase()) {
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

function removePathExtension(path: string): string {
  return path.slice(0, -3);
}