import ts, { ImportDeclaration } from 'typescript';
import DependencyObj from '../Dependencies/DependencyObj.model';

class ImportsBuilder {

  private getImportDeclaration(dependencyObj: DependencyObj, path: string) {
    return ts.createImportDeclaration(undefined, undefined, ts.createImportClause(
      <any>ts.createObjectLiteral(<any>dependencyObj.paths[path].map((x: string) => ts.createIdentifier(x))), undefined), ts.createLiteral(path));
  }

  public getImportsTemplate(dependencyObj: DependencyObj): ImportDeclaration[] {
    const result = [];
    for (const path in dependencyObj.paths) {
      result.push(
        this.getImportDeclaration(dependencyObj, path)
      );
    }
    return result;
  }
}

export default ImportsBuilder;