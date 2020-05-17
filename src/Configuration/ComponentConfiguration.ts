import ConfigBuilder from "./Configuration";
import ts, { Identifier, PropertyAssignment, ObjectLiteralExpression, CallExpression, ExpressionStatement, ParameterDeclaration, ClassDeclaration } from "typescript";
import { declarations, testBed, providers, compileComponents } from "../shared/identifiers";

class ComponentConfiguration extends ConfigBuilder {
  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(classNode, constructorParams, useMasterServiceStub);
  }

  private getTestBedTemplate(testingModule: CallExpression): ExpressionStatement {
    return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>ts.createPropertyAccess(testingModule, <any>ts.createCall(compileComponents, undefined, undefined))));
  }

  private getDeclarationsTemplate(): PropertyAssignment {
    const className: Identifier = ts.createIdentifier(this.classNode.name.text);
    return ts.createPropertyAssignment(declarations, ts.createArrayLiteral([className]));
  }

  public getProvidersTemplate(): PropertyAssignment {
    const providersArray: ObjectLiteralExpression[] = this.generateStubs();
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      providersArray
    ));
  }

  public getConfigurationTemplate(): ExpressionStatement {
    const testingModule = this.getTestingModuleTemplate([this.getDeclarationsTemplate(), this.getProvidersTemplate()]);
    return this.getConfiguration(this.getTestBedTemplate(testingModule));
  }
}

export default ComponentConfiguration;

