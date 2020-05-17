import fs from 'fs';
import path from 'path';
import { isExportDefault } from '../shared/regex';
import DependencyObj from './DependencyObj.model';
import { removePathExtension } from '../shared/helpers';

const excludedDirectories = {
  node_modules: true,
  dist: true,
  '.git': true
};

function getStubPathAndExport(fileName: string, stubName: string): DependencyObj {
  const currentDirectory: string = process.cwd();
  const dependencyPath: string = searchFileSystem(fileName, path.dirname(currentDirectory));

  if (dependencyPath) {
    const content = fs.readFileSync(dependencyPath, 'utf8');
    let relativePath = path.relative(currentDirectory, removePathExtension(dependencyPath));

    if (currentDirectory === path.dirname(dependencyPath)) {
      relativePath = `./${relativePath}`;
    }

    if (!isExportDefault.test(content)) {
      return { [relativePath]: { [stubName]: stubName } };
    } else {
      return { [relativePath]: { default: stubName } };
    }
  }
}

function searchFileSystem(stubName: string, currentPath: string): string {
  let fileFound: string;
  const inner = (currentPath: string) => {
    if (!fileFound) {
      const files: string[] = fs.readdirSync(currentPath);

      for (const file in files) {
        const currentFile: string = currentPath + '/' + files[file];
        const stats: fs.Stats = fs.statSync(currentFile);
        if (stats.isFile() && path.basename(currentFile).toLowerCase() === stubName.toLowerCase()) {
          fileFound = currentFile;
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

export default getStubPathAndExport;