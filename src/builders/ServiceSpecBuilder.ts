import SpecFileBuilder from "./SpecFileBuilder";
import { Stub } from "../interfaces/Stub";
import { getServiceProviders, getServiceDeclarations, getConfiguration } from '../templates/configuration';
import ts from "typescript";

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
    const declarations = getServiceDeclarations();
    const providers = getServiceProviders(stubs, this.classNode.name.text);
    const config = getConfiguration(declarations, providers, useMasterServiceStub);
    this.mainDescribeBody.statements = ts.createNodeArray([config, ...this.mainDescribeBody.statements]);
  }
}