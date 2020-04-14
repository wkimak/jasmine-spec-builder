import ConfigBuilder from "./Configuration";
import { StubModel } from "./StubModel";
import ts, { PropertyAssignment, Identifier, CallExpression, ExpressionStatement, ObjectLiteralExpression, SourceFile, ClassDeclaration, ParameterDeclaration } from "typescript";

class ServiceConfiguration extends ConfigBuilder {
  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(classNode, constructorParams, useMasterServiceStub);
  }
  private getProviders(stubs: StubModel[], name: string): PropertyAssignment {
    const providers: Identifier = ts.createIdentifier('providers');
    const className: Identifier = ts.createIdentifier(name);
    const providersArray: ObjectLiteralExpression[] = this.getProviderStubs(stubs);
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      [className, ...providersArray]
    ));
  }

  private getTestingModule(providers: PropertyAssignment): CallExpression {
    const configureTestingModule: Identifier = ts.createIdentifier('configureTestingModule');
    return ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
      [providers], true
    )])
  }

  private getTestBed(testingModule: CallExpression): ExpressionStatement {
    const testBed: Identifier = ts.createIdentifier('TestBed');
    return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>testingModule));
  }

  public getConfigurationTemplate() {
    const providers = this.getProviders(this.generateStubs(), this.classNode.name.text);
    const testingModule = this.getTestingModule(providers);
    return this.getConfiguration(this.getTestBed(testingModule));
  }
}

export default ServiceConfiguration;


