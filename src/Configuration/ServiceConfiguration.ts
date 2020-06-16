import ConfigBuilder from "./Configuration";
import ts, { PropertyAssignment, Identifier, CallExpression, ExpressionStatement, ObjectLiteralExpression, ClassDeclaration, ParameterDeclaration, VariableDeclaration } from "typescript";
import { testBed, providers, service, get } from "../shared/identifiers";
import getBeforeEachTemplate from "../shared/beforeEachTemplate";
import getArrowFnTemplate from "../shared/arrowFunctionTemplate";

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

  private getServiceInitInitTemplate(): ExpressionStatement[] {
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
    return this.getConfiguration(this.getTestBedTemplate(testingModule), this.getServiceInitInitTemplate());
  }
}

export default ServiceConfiguration;


