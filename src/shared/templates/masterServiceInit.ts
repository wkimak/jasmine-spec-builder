import ts, { VariableStatement } from "typescript";

export default function getMasterServiceInit(): VariableStatement {
  return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(ts.createIdentifier('masterServiceStub'), ts.createTypeReferenceNode(ts.createIdentifier('MasterServiceStub'), undefined))], ts.NodeFlags.Let));
}
