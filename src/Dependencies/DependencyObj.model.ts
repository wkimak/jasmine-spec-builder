export default interface DependencyObj {
  paths: {
    [path: string]: string[]
  },
  names: {
    [name: string]: boolean;
  }
}