
interface DependencyNames {
  [name: string]: string
}

interface PathForImports {
  [path: string]: DependencyNames;
}

interface DependencyNameForProviders {
  [name: string]: boolean;
}

interface DependencyObj {
  pathsForImports: PathForImports,
  dependencyNamesForProviders: DependencyNameForProviders
}

export { DependencyNames, DependencyObj, PathForImports, DependencyNameForProviders };
