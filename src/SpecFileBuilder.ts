import ts, { SourceFile, ImportDeclaration, ClassDeclaration, ParameterDeclaration, VariableStatement, ExpressionStatement } from 'typescript';
import ImportsBuilder from './Imports/Imports';
import DescribesBuilder from './Describes/Describes';
import ComponentConfiguration from './Configuration/ComponentConfiguration';
import ServiceConfiguration from './Configuration/ServiceConfiguration';
import { isComponentFile } from './shared/regex';
import Dependencies from './Dependencies/Dependencies';
import DependencyObj from './Dependencies/DependencyObj.model';

export default class SpecFileBuilder {
  dependancyObj: DependencyObj;
  classNode: ClassDeclaration;
  constructorParams: ts.NodeArray<ParameterDeclaration>;
  imports: ImportDeclaration[];
  describes: ExpressionStatement[];
  configuration: (VariableStatement | ExpressionStatement)[];

  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    this.classNode = this.findClassNode(sourceFile);
    this.constructorParams = this.findConstructorParams(this.classNode);
    this.dependancyObj = new Dependencies(sourceFile, this.classNode, this.constructorParams, useMasterServiceStub).getDependancyObj();
    this.imports = new ImportsBuilder().getImportsTemplate(this.dependancyObj);
    this.configuration = isComponentFile.test(sourceFile.fileName) ?
      new ComponentConfiguration(this.dependancyObj, this.classNode, this.constructorParams, useMasterServiceStub).getConfigurationTemplate() :
      new ServiceConfiguration(this.dependancyObj, this.classNode, this.constructorParams, useMasterServiceStub).getConfigurationTemplate();
    this.describes = new DescribesBuilder(sourceFile, this.configuration).getDescribesTemplate();
  }


  private findClassNode(sourceFile: SourceFile): ClassDeclaration {
    for (const childNode of sourceFile.statements) {
      if (ts.isClassDeclaration(childNode)) {
        return childNode;
      }
    }
  }

  private findConstructorParams(classNode: ClassDeclaration): ts.NodeArray<ParameterDeclaration> {
    for (const member of classNode.members) {
      if (ts.isConstructorDeclaration(member)) {
        return member.parameters;
      }
    }
  };

  public build(targetFile: SourceFile): SourceFile {
    targetFile.statements = ts.createNodeArray([...this.imports, ...this.describes]);
    return targetFile;
  }
}