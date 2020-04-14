import ts, { SourceFile, ImportDeclaration, ClassDeclaration, ParameterDeclaration } from 'typescript';
import ImportsBuilder from './Imports/Imports';
import DescribesBuilder from './Describes/Describes';
import ComponentConfiguration from './Configuration/ComponentConfiguration';
import ServiceConfiguration from './Configuration/ServiceConfiguration';
import { isComponentFile } from './shared/regex';

export default class SpecFileBuilder {
  classNode: ClassDeclaration;
  constructorParams: ts.NodeArray<ParameterDeclaration>;
  useMasterService: boolean;
  imports: ImportDeclaration[];
  describes;
  configuration;

  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    this.classNode = this.findClassNode(sourceFile);
    this.constructorParams = this.findConstructorParams(this.classNode);
    this.imports = new ImportsBuilder(sourceFile, this.classNode, this.constructorParams, useMasterServiceStub).getImportsTemplate();
    this.describes = new DescribesBuilder(sourceFile).getDescribesTemplate();
    this.configuration = isComponentFile.test(sourceFile.fileName) ?
      new ComponentConfiguration(this.classNode, this.constructorParams, useMasterServiceStub).getConfigurationTemplate() :
      new ServiceConfiguration(this.classNode, this.constructorParams, useMasterServiceStub).getConfigurationTemplate();
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
    this.describes.forEach(childNode => {
      const body = childNode.expression.arguments[1].body;
      const isClassDescribe = body.statements.length > 0;
      if (isClassDescribe) {
        body.statements = ts.createNodeArray([...this.configuration, ...body.statements]);
      }
    });

    targetFile.statements = ts.createNodeArray([...this.imports, ...this.describes]);
    return targetFile;
  }
}





  // Differences
  // Services
  // Configuration is different:
  // no Declarations array
  // Service is listed as a provider
  // potential to add imports specific to services (FormsModule)
  // potential to add form field describe blocks

  // resources
  // Configuration is different:
  // no Declarations array
  // Resource is listed as a provider
  // potential to add imports specific to resources (HttpRequestModule) 
  // potential to add http request describe blocks based on HTTP verbs 


  // Making methods independant:
  // setSourceFiles must be called first
  // set sourceFile
  // set targetFile
  // buildFile must be called last
