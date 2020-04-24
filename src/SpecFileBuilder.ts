import ts, { SourceFile, ImportDeclaration, ClassDeclaration, ParameterDeclaration, VariableStatement, ExpressionStatement } from 'typescript';
import ImportsBuilder from './Imports/Imports';
import DescribesBuilder from './Describes/Describes';
import ComponentConfiguration from './Configuration/ComponentConfiguration';
import ServiceConfiguration from './Configuration/ServiceConfiguration';
import { isComponentFile } from './shared/regex';
import Dependencies from './Dependencies/Dependencies';
import DependencyObj from './Dependencies/DependencyObj.model';
import { findClassNode, findConstructorParams } from './shared/helpers';

export default class SpecFileBuilder {
  imports: ImportDeclaration[];
  describes: ExpressionStatement[];

  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    const classNode: ClassDeclaration = findClassNode(sourceFile);
    const constructorParams: ts.NodeArray<ParameterDeclaration> = findConstructorParams(classNode);
    const dependancyObj: DependencyObj = new Dependencies(sourceFile, classNode, constructorParams, useMasterServiceStub).getDependancyObj();
    const configuration: (VariableStatement | ExpressionStatement)[] = isComponentFile.test(sourceFile.fileName) ?
      new ComponentConfiguration(dependancyObj, classNode, constructorParams, useMasterServiceStub).getConfigurationTemplate() :
      new ServiceConfiguration(dependancyObj, classNode, constructorParams, useMasterServiceStub).getConfigurationTemplate();
    this.imports = new ImportsBuilder().getImportsTemplate(dependancyObj);
    this.describes = new DescribesBuilder(sourceFile, configuration).getDescribesTemplate();
  }

  public build(targetFile: SourceFile): SourceFile {
    targetFile.statements = ts.createNodeArray([...this.imports, ...this.describes]);
    return targetFile;
  }
}