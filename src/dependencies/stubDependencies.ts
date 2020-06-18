import fs from 'fs';
import path from 'path';
import { isExportDefault } from '../shared/regex';
import { DependencyObj } from './DependencyObj.model';
import { removePathExtension } from '../shared/helpers';

const excludedDirectories = {
  node_modules: true,
  dist: true,
  '.git': true
};

function findRootDirectory(currentDirectory: string): string {
  const files: string[] = fs.readdirSync(currentDirectory);

  for (let file in files) {
    if (files[file] === 'package.json') {
      return currentDirectory;
    }
  }

  return findRootDirectory(path.dirname(currentDirectory));
}

function getStubPathAndExport(targetFileName: string, stubName: string, currentDirectory: string, projectRootDirectory: string): DependencyObj {
  const dependencyPath: string = searchFileSystem(targetFileName, projectRootDirectory);
  if (dependencyPath) {
    const content = fs.readFileSync(dependencyPath, 'utf8');

    // Make path separators consistent beetween Windows and Mac
    let relativePath = path.relative(currentDirectory, removePathExtension(dependencyPath)).split(path.sep).join('/');

    if (currentDirectory.split(path.sep).join('/') === path.dirname(dependencyPath).split(path.sep).join('/')) {
      relativePath = `./${relativePath}`;
    }

    if (!isExportDefault.test(content)) {
      return { [relativePath]: { [stubName]: stubName } };
    } else {
      return { [relativePath]: { default: stubName } };
    }
  } else {
    console.log(`${targetFileName} file was not found. If you intended to use stub, your stub's file name must be the provider’s name with a suffix of ’Stub.ts’ (i.e. Router --> RouterStub.ts).`)
  }
}

function searchFileSystem(targetFileName: string, currentPath: string): string {
  const files: string[] = fs.readdirSync(currentPath);

  for (const file in files) {
    const currentFile: string = currentPath + '/' + files[file];
    const stats: fs.Stats = fs.statSync(currentFile);
    if (stats.isFile() && path.basename(currentFile).toLowerCase() === targetFileName.toLowerCase()) {
      return currentFile;
    }
    else if (stats.isDirectory() && !excludedDirectories.hasOwnProperty(path.basename(currentPath))) {
      const foundFile = searchFileSystem(targetFileName, currentFile);
      if (foundFile) {
        return foundFile;
      }
    }
  }
}

export { findRootDirectory, searchFileSystem };
export default getStubPathAndExport;