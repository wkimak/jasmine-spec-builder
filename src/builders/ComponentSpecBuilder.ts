import SpecFileBuilder from "./SpecFileBuilder";
import ts from 'typescript';
import { Stub } from "../interfaces/Stub";
import { getComponentProviders, getComponentDeclarations, getConfiguration } from '../templates/configuration';


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
    const providers = getComponentProviders(stubs);
    const declarations = getComponentDeclarations(this.classNode.name.text);
    const config = getConfiguration(providers, declarations, useMasterServiceStub);
    this.mainDescribeBody.statements = ts.createNodeArray([config, ...this.mainDescribeBody.statements]);
  }
}