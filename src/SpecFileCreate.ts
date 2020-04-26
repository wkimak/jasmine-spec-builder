import ts, { SourceFile, VariableStatement, ExpressionStatement } from 'typescript';
import DescribesBuilder from './Describes/Describes';
import ComponentConfiguration from './Configuration/ComponentConfiguration';
import ServiceConfiguration from './Configuration/ServiceConfiguration';
import { isComponentFile } from './shared/regex';
import SpecFileBuilder from './SpecFileBuilder';

class SpecFileCreate extends SpecFileBuilder {
  constructor(sourceFile: SourceFile, useMasterServiceStub: boolean) {
    super(sourceFile, useMasterServiceStub);
  }

  public build(targetFile: SourceFile): SourceFile {
    const configuration: (VariableStatement | ExpressionStatement)[] = isComponentFile.test(this.sourceFile.fileName) ?
      new ComponentConfiguration(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate() :
      new ServiceConfiguration(this.dependencyObj, this.classNode, this.constructorParams, this.useMasterServiceStub).getConfigurationTemplate();
    const describes = new DescribesBuilder(this.sourceFile, configuration).getDescribesTemplate();

    targetFile.statements = ts.createNodeArray([...this.imports, ...describes]);
    return targetFile;
  }
}

export default SpecFileCreate;