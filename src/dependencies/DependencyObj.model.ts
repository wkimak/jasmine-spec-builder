
interface DependencyNames {
  [name: string]: string
}

interface DependencyObj {
  [path: string]: DependencyNames;
}

export { DependencyNames, DependencyObj }
