import ts, { SourceFile } from 'typescript';
import ComponentConfiguration from './Configuration/ComponentConfiguration';
import ServiceConfiguration from './Configuration/ServiceConfiguration';
import SpecFileBuilder from './SpecFileBuilder';
import getDependancyObj from './dependencies/dependencies';
import getImportsTemplate from './imports/imports';
import getDescribesTemplate from './describes/describes';

class SpecFileCreate extends SpecFileBuilder {
  constructor(sourceFile: SourceFile, targetFile: SourceFile, useMasterServiceStub: boolean) {
    super(sourceFile, targetFile, useMasterServiceStub);
  }

  public build(): SourceFile {
    const dependencyObj = getDependancyObj(this.isComponent, this.sourceFile, this.classNode, this.constructorParams, this.useMasterServiceStub);
    const imports = getImportsTemplate(dependencyObj);
    const configuration: any[] = this.isComponent ?
      new ComponentConfiguration(this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate() :
      new ServiceConfiguration(this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate();
    const describes = getDescribesTemplate(this.sourceFile, configuration);

    this.targetFile.statements = ts.createNodeArray([...imports, ...describes]);
    return this.targetFile;
  }
}

export default SpecFileCreate;