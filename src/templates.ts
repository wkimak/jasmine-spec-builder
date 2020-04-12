import ts, { ExpressionStatement, ImportDeclaration, ArrowFunction, Statement, CallExpression, Identifier, PropertyAssignment, ObjectLiteralExpression, VariableStatement } from 'typescript';

export function getArrowFn(statements: Statement[] = []): ArrowFunction {
    return ts.createArrowFunction(
        undefined,
        undefined,
        [
            ts.createParameter(undefined, undefined, undefined, <any>ts.createToken(null), undefined, undefined, undefined)
        ],
        undefined,
        ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.createBlock(statements, true)
    );
}

export function getDescribe(name: string): ExpressionStatement {
    return ts.createExpressionStatement(ts.createCall(ts.createIdentifier('describe'), undefined, [ts.createStringLiteral(name), getArrowFn()]));
}

export function getImport(importNames: string[], path: string): ImportDeclaration {
    const properties = [];
    importNames.forEach(name => properties.push(ts.createIdentifier(name)));
    return ts.createImportDeclaration(undefined, undefined, ts.createImportClause(
        <any>ts.createObjectLiteral(properties), undefined), ts.createLiteral(path));
}

export function getMasterServiceInit(): VariableStatement {
    return ts.createVariableStatement(undefined, ts.createVariableDeclarationList([ts.createVariableDeclaration(ts.createIdentifier('masterServiceStub'), ts.createTypeReferenceNode(ts.createIdentifier('MasterServiceStub'), undefined))], ts.NodeFlags.Let));
}
