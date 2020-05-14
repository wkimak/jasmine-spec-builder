import ConfigBuilder from "./Configuration";
import { StubModel } from "./StubModel";
import ts, { PropertyAssignment, Identifier, CallExpression, ExpressionStatement, ObjectLiteralExpression, ClassDeclaration, ParameterDeclaration } from "typescript";
import { configureTestingModule, testBed, providers } from "../shared/identifiers";

class ServiceConfiguration extends ConfigBuilder {
  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(classNode, constructorParams, useMasterServiceStub);
  }

  private getTestingModule(providers: PropertyAssignment): CallExpression {
    return ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
      [providers], true
    )])
  }

  private getTestBed(testingModule: CallExpression): ExpressionStatement {
    return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>testingModule));
  }

  public getProviders(): PropertyAssignment {
    const stubs: StubModel[] = this.generateStubs();
    const className: Identifier = ts.createIdentifier(this.classNode.name.text);
    const providersArray: ObjectLiteralExpression[] = this.getProviderStubs(stubs);
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      [className, ...providersArray]
    ));
  }

  public getConfigurationTemplate(): ExpressionStatement {
    const providers = this.getProviders();
    const testingModule = this.getTestingModule(providers);
    return this.getConfiguration(this.getTestBed(testingModule));
  }
}

export default ServiceConfiguration;


