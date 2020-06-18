import ConfigBuilder from "./Configuration";
import ts, { PropertyAssignment, Identifier, CallExpression, ExpressionStatement, ObjectLiteralExpression, ClassDeclaration, ParameterDeclaration, VariableDeclaration, VariableStatement } from "typescript";
import { testBed, providers, service, get, component } from "../shared/identifiers";
import { DependencyObj } from "../dependencies/DependencyObj.model";

class ServiceConfiguration extends ConfigBuilder {
  constructor(dependencyObj: DependencyObj, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(dependencyObj, classNode, constructorParams, useMasterServiceStub);
  }

  private getTestBedTemplate(testingModule: CallExpression): ExpressionStatement {
    return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>testingModule));
  }

  public getProvidersTemplate(): PropertyAssignment {
    const className: Identifier = ts.createIdentifier(this.classNode.name.text);
    const providersArray: (ObjectLiteralExpression | Identifier)[] = this.generateStubs();
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      [className, ...providersArray]
    ));
  }

  private getServiceDeclarationTemplate(): VariableStatement {
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(service, ts.createTypeReferenceNode(ts.createIdentifier(this.classNode.name.text), undefined))], ts.NodeFlags.Let));
  } 

  private getServiceInitTemplate(): ExpressionStatement[] {
    return [
      ts.createExpressionStatement(
        ts.createBinary(service, ts.SyntaxKind.EqualsToken,
          ts.createPropertyAccess(testBed, <any>ts.createCall(get, undefined,
            [ts.createIdentifier(this.classNode.name.text)]))
        )
      )
    ]
  }

  public getConfigurationTemplate(): ExpressionStatement[] {
    const testingModule = this.getTestingModuleTemplate([this.getProvidersTemplate()]);
    const testBed = this.getTestBedTemplate(testingModule);
    const serviceInit = this.getServiceInitTemplate();
    const serviceDeclaration = this.getServiceDeclarationTemplate();

    return this.getConfiguration([serviceDeclaration], testBed, serviceInit);
  }
}

export default ServiceConfiguration;


