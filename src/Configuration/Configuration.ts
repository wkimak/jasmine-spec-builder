import { StubModel } from "./StubModel.js";
import ts, { ExpressionStatement, ObjectLiteralExpression, VariableStatement, ParameterDeclaration, ClassDeclaration } from "typescript";
import getArrowFn from "../shared/arrowFunction.js";
import { getStubName } from "../shared/helpers.js";
import { provide, useClass, masterServiceStub, beforeEach, async, MasterServiceStub } from '../shared/identifiers.js';

class Configuration {
  constructorParams: ts.NodeArray<ParameterDeclaration>;
  useMasterServiceStub: boolean;
  classNode: ClassDeclaration;

  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    this.classNode = classNode;
    this.constructorParams = constructorParams;
    this.useMasterServiceStub = useMasterServiceStub;
  }

  protected generateStubs(): StubModel[] {
    const stubs: StubModel[] = [];
    this.constructorParams.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      const stubName = getStubName(provider);

      if (this.useMasterServiceStub) {
        const masterStubName = `masterServiceStub.${provider.slice(0, 1).toLowerCase() + provider.slice(1)}Stub`;
        stubs.push({ provider, class: masterStubName });
      } else {
        stubs.push({ provider, class: stubName });
      }
    });
    return stubs; 
  }

  protected getProviderStubs(stubs: StubModel[]): ObjectLiteralExpression[] {
    return stubs.map(stub => {
      return ts.createObjectLiteral([ts.createPropertyAssignment(provide, ts.createIdentifier(stub.provider)),
      ts.createPropertyAssignment(useClass, ts.createIdentifier(stub.class))])
    });
  }

  public getMasterServiceInit(): VariableStatement {
    const masterInit: ts.AsExpression = ts.createAsExpression(ts.createNew(MasterServiceStub, undefined, undefined), undefined);
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(masterServiceStub, undefined, masterInit)], ts.NodeFlags.Const));
  }

  public getStatements(testBed) {
    return this.useMasterServiceStub ? [this.getMasterServiceInit(), testBed] : [testBed];
  }

  protected getConfiguration(testBed: ExpressionStatement): ExpressionStatement {
    const statements = this.getStatements(testBed);
    const expression = ts.createExpressionStatement(ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [getArrowFn(statements)])]));
    return expression;
  }
}

export default Configuration;