import ConfigBuilder from "./Configuration";
import ts, { Identifier, PropertyAssignment, ObjectLiteralExpression, CallExpression, ExpressionStatement, ParameterDeclaration, ClassDeclaration, VariableDeclarationList } from "typescript";
import { declarations, testBed, providers, compileComponents, component, createComponent, fixture, componentInstance, async } from "../shared/identifiers";
import getArrowFnTemplate from "../shared/arrowFunctionTemplate";

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

  private getComponentFixtureTemplate(): ExpressionStatement[] {

    return [
      ts.createExpressionStatement(
        ts.createBinary(fixture, ts.SyntaxKind.EqualsToken, ts.createPropertyAccess(testBed, <any>ts.createCall(createComponent, undefined,
          [ts.createIdentifier(this.classNode.name.text)])))),

      ts.createExpressionStatement(
        ts.createBinary(component, ts.SyntaxKind.EqualsToken, ts.createPropertyAccess(testBed, componentInstance)
        ))
    ];
  }

  public getProvidersTemplate(): PropertyAssignment {
    const providersArray: ObjectLiteralExpression[] = this.generateStubs();
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      providersArray
    ));
  }

  public getConfigurationTemplate(): ExpressionStatement[] {
    const testingModule = this.getTestingModuleTemplate([this.getDeclarationsTemplate(), this.getProvidersTemplate()]);
    return this.getConfiguration(this.getTestBedTemplate(testingModule), this.getComponentFixtureTemplate());
  }
}

export default ComponentConfiguration;

