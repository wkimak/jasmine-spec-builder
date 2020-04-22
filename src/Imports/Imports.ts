import ts, { ImportDeclaration } from 'typescript';
import DependencyObj from '../Dependencies/DependencyObj.model';

class ImportsBuilder {
  
  public getImportsTemplate(dependencyObj: DependencyObj): ImportDeclaration[] {
    const result = [];
    for (const path in dependencyObj.paths) {
      result.push(
        ts.createImportDeclaration(undefined, undefined, ts.createImportClause(
          <any>ts.createObjectLiteral(<any>dependencyObj.paths[path].map((x: string) => ts.createIdentifier(x))), undefined), ts.createLiteral(path))
      );
    }
    return result;
  }
}

export default ImportsBuilder;