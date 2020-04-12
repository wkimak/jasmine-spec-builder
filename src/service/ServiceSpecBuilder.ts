import { Stub } from "../shared/interfaces/Stub";
import { getConfiguration } from '../shared/templates/configuration';
import ts from "typescript";
import SpecFileBuilder from '../shared/SpecFileBuilder';
import { getServiceConfig } from './configuration';

export class ServiceSpecBuilder extends SpecFileBuilder {
  constructor(serviceFileName: string, specFileName: string, useMasterServiceStub: boolean) {
    super();
    this.setSourceFiles(serviceFileName, specFileName);
    this.buildDescribes(this.sourceFile, this.targetFile);
    this.buildConfiguration(this.generateStubs(useMasterServiceStub), useMasterServiceStub);
    this.buildImports();
    useMasterServiceStub && this.buildMasterServiceDeclaration();
  }

  private buildConfiguration(stubs: Stub[], useMasterServiceStub: boolean): void {
    const config = getConfiguration(getServiceConfig(stubs, this.classNode.name.text), useMasterServiceStub);
    this.mainDescribeBody.statements = ts.createNodeArray([config, ...this.mainDescribeBody.statements]);
  }
}