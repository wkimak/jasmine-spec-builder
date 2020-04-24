import ConfigBuilder from "./Configuration";
import { StubModel } from "./StubModel";
import ts, { PropertyAssignment, Identifier, CallExpression, ExpressionStatement, ObjectLiteralExpression, SourceFile, ClassDeclaration, ParameterDeclaration, VariableStatement } from "typescript";
import DependencyObj from "../Dependencies/DependencyObj.model";

class ServiceConfiguration extends ConfigBuilder {
  constructor(dependencyObj: DependencyObj, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(dependencyObj, classNode, constructorParams, useMasterServiceStub);
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

  public getProviders(): PropertyAssignment {
    const stubs: StubModel[] = this.generateStubs();
    const providers: Identifier = ts.createIdentifier('providers');
    const className: Identifier = ts.createIdentifier(this.classNode.name.text);
    const providersArray: ObjectLiteralExpression[] = this.getProviderStubs(stubs);
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      [className, ...providersArray]
    ));
  }

  public getConfigurationTemplate(): (VariableStatement | ExpressionStatement)[] {
    const providers = this.getProviders();
    const testingModule = this.getTestingModule(providers);
    return this.getConfiguration(this.getTestBed(testingModule));
  }
}

export default ServiceConfiguration;


