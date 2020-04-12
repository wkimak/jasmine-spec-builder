import SpecFileBuilder from "../shared/SpecFileBuilder";
import ts from 'typescript';
import { Stub } from "../shared/interfaces/Stub";
import { getComponentConfig } from './configuration';
import { getConfiguration } from '../shared/templates/configuration';


export class ComponentSpecBuilder extends SpecFileBuilder {
  constructor(componentFileName: string, specFileName: string, useMasterServiceStub: boolean) {
    super();
    this.setSourceFiles(componentFileName, specFileName);
    this.buildDescribes(this.sourceFile, this.targetFile);
    this.buildConfiguration(this.generateStubs(useMasterServiceStub), useMasterServiceStub);
    this.buildImports();
    useMasterServiceStub && this.buildMasterServiceDeclaration();
  }

  private buildConfiguration(stubs: Stub[], useMasterServiceStub: boolean): void {
    const config = getConfiguration(getComponentConfig(stubs, this.classNode.name.text), useMasterServiceStub);
    this.mainDescribeBody.statements = ts.createNodeArray([config, ...this.mainDescribeBody.statements]);
  }
}