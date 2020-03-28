const ts = require('typescript');

function getArrowFn() {
    return ts.createArrowFunction(
        undefined,
        undefined,
        [
            ts.createParameter(undefined, undefined, undefined, ts.createToken(null), undefined, undefined, undefined)
        ],
        undefined,
        ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.createBlock({}, true)
    );
}

function getDescribe(name) {
    return ts.createMethodSignature(undefined, [ts.createStringLiteral(name), getArrowFn()], undefined, 'describe', undefined);
}


const imports = [
    `import { TestBed, async } from '@angular/core/testing';`,
];

function getConfiguration() {
    return `
    beforeEach(async(() => {
        TestBed.configureTestingModule({
          declarations: [],
        }).compileComponents();
      }));
    `
}

exports.getDescribe = getDescribe;
exports.imports = imports;
exports.getConfiguration = getConfiguration;


