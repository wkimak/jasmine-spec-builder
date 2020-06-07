import ts, { ExpressionStatement, ObjectLiteralExpression, VariableStatement, ParameterDeclaration, ClassDeclaration, PropertyAssignment, CallExpression, Identifier } from "typescript";
import getArrowFnTemplate from "../shared/arrowFunction.js";
import { getStubName } from "../shared/helpers.js";
import { provide, useClass, masterServiceStub, beforeEach, async, MasterServiceStub, configureTestingModule } from '../shared/identifiers.js';

class Configuration {
  constructorParams: ts.NodeArray<ParameterDeclaration>;
  useMasterServiceStub: boolean;
  classNode: ClassDeclaration;

  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    this.classNode = classNode;
    this.constructorParams = constructorParams;
    this.useMasterServiceStub = useMasterServiceStub;
  }

  protected generateStubs(): ObjectLiteralExpression[] {
    const stubTemplates: ObjectLiteralExpression[] = [];
    this.constructorParams.forEach((param: any) => {
      const typeName: Identifier = param.type.typeName;
      if (typeName) {
        const providerName: string = typeName.text;
        let stubName = getStubName(providerName);

        if (this.useMasterServiceStub) {
          stubName = getStubName(`masterServiceStub.${providerName.slice(0, 1).toLowerCase() + providerName.slice(1)}`);
        }

        stubTemplates.push(this.getProviderStubTemplate(providerName, stubName));
      }
    });
    return stubTemplates;
  }

  protected getProviderStubTemplate(providerName: string, stubName: string): ObjectLiteralExpression {
    return ts.createObjectLiteral([ts.createPropertyAssignment(provide, ts.createIdentifier(providerName)),
    ts.createPropertyAssignment(useClass, ts.createIdentifier(stubName))])
  }

  protected getTestingModuleTemplate(keyValues: PropertyAssignment[]): CallExpression {
    return ts.createCall(configureTestingModule, undefined, [ts.createObjectLiteral(
      keyValues, true
    )])
  }

  public getMasterServiceInitTemplate(): VariableStatement {
    const masterInit: ts.AsExpression = ts.createAsExpression(ts.createNew(MasterServiceStub, undefined, undefined), undefined);
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(masterServiceStub, undefined, masterInit)], ts.NodeFlags.Const));
  }

  public getTestBedStatements(testBed: ExpressionStatement): (ExpressionStatement | VariableStatement)[] {
    return this.useMasterServiceStub ? [this.getMasterServiceInitTemplate(), testBed] : [testBed];
  }

  protected getConfiguration(testBed: ExpressionStatement): ExpressionStatement {
    const testBedStatements = this.getTestBedStatements(testBed);
    return ts.createExpressionStatement(ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [getArrowFnTemplate(testBedStatements)])]));
  }
}

export default Configuration;