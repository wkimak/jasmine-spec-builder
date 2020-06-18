import ConfigBuilder from "./Configuration";
import ts, { Identifier, PropertyAssignment, ObjectLiteralExpression, CallExpression, ExpressionStatement, ParameterDeclaration, ClassDeclaration, VariableDeclarationList, VariableStatement } from "typescript";
import { declarations, testBed, providers, compileComponents, component, createComponent, fixture, componentInstance, async, componentFixture } from "../shared/identifiers";
import { DependencyObj } from "../dependencies/DependencyObj.model";

class ComponentConfiguration extends ConfigBuilder {
  constructor(dependencyObj: DependencyObj, classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    super(dependencyObj, classNode, constructorParams, useMasterServiceStub);
  }

  private getTestBedTemplate(testingModule: CallExpression): ExpressionStatement {
    return ts.createExpressionStatement(ts.createPropertyAccess(testBed, <any>ts.createPropertyAccess(testingModule, <any>ts.createCall(compileComponents, undefined, undefined))));
  }

  private getDeclarationsTemplate(): PropertyAssignment {
    const className: Identifier = ts.createIdentifier(this.classNode.name.text);
    return ts.createPropertyAssignment(declarations, ts.createArrayLiteral([className]));
  }

  private getComponentDeclarationTemplate(): VariableStatement {
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(component, ts.createTypeReferenceNode(ts.createIdentifier(this.classNode.name.text), undefined))], ts.NodeFlags.Let));
  }

  private getFixtureDeclarationTemplate(): VariableStatement {
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(fixture, ts.createTypeReferenceNode(componentFixture, [ts.createTypeReferenceNode(this.classNode.name.text, undefined)]))], ts.NodeFlags.Let));
  }

  private getComponentFixtureTemplate(): ExpressionStatement[] {

    return [
      ts.createExpressionStatement(
        ts.createBinary(fixture, ts.SyntaxKind.EqualsToken, ts.createPropertyAccess(testBed, <any>ts.createCall(createComponent, undefined,
          [ts.createIdentifier(this.classNode.name.text)])))),

      ts.createExpressionStatement(
        ts.createBinary(component, ts.SyntaxKind.EqualsToken, ts.createPropertyAccess(fixture, componentInstance)
        ))
    ];
  }

  public getProvidersTemplate(): PropertyAssignment {
    const providersArray: (ObjectLiteralExpression | Identifier)[] = this.generateStubs();
    return ts.createPropertyAssignment(providers, ts.createArrayLiteral(
      providersArray
    ));
  }

  public getConfigurationTemplate(): ExpressionStatement[] {
    const componentDeclaration = this.getComponentDeclarationTemplate();
    const fixtureDeclaration = this.getFixtureDeclarationTemplate();
    const testingModule = this.getTestingModuleTemplate([this.getDeclarationsTemplate(), this.getProvidersTemplate()]);
    const testBed = this.getTestBedTemplate(testingModule);
    const componentFixture = this.getComponentFixtureTemplate();

    return this.getConfiguration([componentDeclaration, fixtureDeclaration], testBed, componentFixture);
  }
}

export default ComponentConfiguration;

