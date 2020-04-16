import { StubModel } from "./StubModel";
import ts, { Identifier, ExpressionStatement, ObjectLiteralExpression, VariableStatement, ParameterDeclaration, SourceFile, ClassDeclaration } from "typescript";
import getArrowFn from "../shared/arrowFunction";
import { findRelativeStubPath } from "../Imports/pathHelpers";

class Configuration {
  classNode: ClassDeclaration;
  constructorParams: ts.NodeArray<ParameterDeclaration>;
  useMasterServiceStub: boolean;

  constructor(classNode: ClassDeclaration, constructorParams: ts.NodeArray<ParameterDeclaration>, useMasterServiceStub: boolean) {
    this.classNode = classNode;
    this.constructorParams = constructorParams;
    this.useMasterServiceStub = useMasterServiceStub;
  }

  private getMasterServiceInit(): VariableStatement {
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(ts.createIdentifier('masterServiceStub'), ts.createTypeReferenceNode(ts.createIdentifier('MasterServiceStub'), undefined))], ts.NodeFlags.Let));
  }

  protected generateStubs(): StubModel[] {
    const stubs: StubModel[] = [];
    this.constructorParams.forEach((param: any) => {
      const provider: string = param.type.typeName.text;
      let stubName: string;
      if (this.useMasterServiceStub) {
        stubName = `masterServiceStub.${provider.slice(0, 1).toLowerCase() + provider.slice(1)}Stub`;
        if (findRelativeStubPath('MasterServiceStub') && findRelativeStubPath(provider + 'Stub')) {
          stubs.push({ provider, class: stubName });
        }
      } else {
        stubName = provider + 'Stub';
        if (findRelativeStubPath(stubName)) {
          stubs.push({ provider, class: stubName });
        }
      }
    });
    return stubs;
  }

  protected getProviderStubs(stubs: StubModel[]): ObjectLiteralExpression[] {
    const provide: Identifier = ts.createIdentifier('provide');
    const useClass: Identifier = ts.createIdentifier('useClass');
    return stubs.map(stub => {
      return ts.createObjectLiteral([ts.createPropertyAssignment(provide, ts.createIdentifier(stub.provider)),
      ts.createPropertyAssignment(useClass, ts.createIdentifier(stub.class))])
    });
  }

  protected getConfiguration(testBed: ExpressionStatement) {
    const beforeEach: Identifier = ts.createIdentifier("beforeEach");
    const async: Identifier = ts.createIdentifier('async');
    const masterServiceStub: Identifier = ts.createIdentifier('masterServiceStub');
    const MasterServiceStub: Identifier = ts.createIdentifier('MasterServiceStub');

    const master: ExpressionStatement = ts.createExpressionStatement(ts.createBinary(masterServiceStub, ts.createToken(ts.SyntaxKind.EqualsToken), ts.createNew(MasterServiceStub, undefined, undefined)));
    const statements: ExpressionStatement[] = this.useMasterServiceStub && findRelativeStubPath('MasterServiceStub') ? [master, testBed] : [testBed];
    const expression = ts.createExpressionStatement(ts.createCall(beforeEach, undefined, [ts.createCall(async, undefined, [getArrowFn(statements)])]));
    return this.useMasterServiceStub && findRelativeStubPath('MasterServiceStub') ? [this.getMasterServiceInit(), expression] : [expression];
  }
}

export default Configuration;