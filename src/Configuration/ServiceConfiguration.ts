import ConfigBuilder from "./Configuration";
import ts, { PropertyAssignment, Identifier, CallExpression, ExpressionStatement, ObjectLiteralExpression, ClassDeclaration, ParameterDeclaration } from "typescript";
import { testBed, providers } from "../shared/identifiers";

class ServiceConfiguration extends ConfigBuilder {
  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(classNode, constructorParams, useMasterServiceStub);
  }

  private getTestBedTemplate(testingModule: CallExpression): ExpressionStatement {
    return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>testingModule));
  }

  public getProvidersTemplate(): PropertyAssignment {
    const className: Identifier = ts.createIdentifier(this.classNode.name.text);
    const providersArray: ObjectLiteralExpression[] = this.generateStubs();
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      [className, ...providersArray]
    ));
  }

  public getConfigurationTemplate(): ExpressionStatement {
    const testingModule = this.getTestingModuleTemplate([this.getProvidersTemplate()]);
    return this.getConfiguration(this.getTestBedTemplate(testingModule));
  }
}

export default ServiceConfiguration;


