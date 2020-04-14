import ConfigBuilder from "./Configuration";
import ts, { Identifier, PropertyAssignment, ObjectLiteralExpression, CallExpression, ExpressionStatement, ParameterDeclaration, ClassDeclaration } from "typescript";
import { StubModel } from './StubModel';

class ComponentConfiguration extends ConfigBuilder {

  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(classNode, constructorParams, useMasterServiceStub);
  }

  private getDeclarations(): PropertyAssignment {
    const declarations: Identifier = ts.createIdentifier('declarations');
    const className: Identifier = ts.createIdentifier(this.classNode.name.text);
    return ts.createPropertyAssignment(declarations, ts.createArrayLiteral([className]));
  }

  private getProviders(stubs: StubModel[]): PropertyAssignment {
    const providers: Identifier = ts.createIdentifier('providers');
    const providersArray: ObjectLiteralExpression[] = this.getProviderStubs(stubs);
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      providersArray
    ));
  }

  private getTestingModule(declarations: PropertyAssignment, providers: PropertyAssignment): CallExpression {
    const configureTestingModule: Identifier = ts.createIdentifier('configureTestingModule');
    return ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
      [declarations, providers], true
    )])
  }

  private getTestBed(testingModule: CallExpression): ExpressionStatement {
    const testBed: Identifier = ts.createIdentifier('TestBed');
    const compileComponents: Identifier = ts.createIdentifier('compileComponents');
    return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>ts.createPropertyAccess(testingModule, <any>ts.createCall(compileComponents, undefined, undefined))));
  }

  public getConfigurationTemplate() {
    const declarations = this.getDeclarations();
    const providers = this.getProviders(this.generateStubs());
    const testingModule = this.getTestingModule(declarations, providers);
    return this.getConfiguration(this.getTestBed(testingModule))
  }
}

export default ComponentConfiguration;

