
interface DependencyNames {
  [name: string]: string
}

interface PathForImport {
  [path: string]: DependencyNames;
}

interface DependencyNameForProviders {
  [name: string]: boolean | string;
}

interface DependencyObj {
  pathsForImports: PathForImport,
  dependencyNamesForProviders: DependencyNameForProviders
}

export { DependencyNames, DependencyObj, PathForImport, DependencyNameForProviders };
