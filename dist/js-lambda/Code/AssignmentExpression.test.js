const Compiler = require('./Compiler.js');
const deepMatch = require('../Extensions/Object/deepMatch.node.js');

describe('AssignmentExpression', () => {
    it('should allow basic assignment', (done) => {
        let expected = { type: 'Program',
            body:
                [ { type: 'ExpressionStatement',
                    expression:
                        { type: 'AssignmentExpression',
                            operator: '=',
                            left:
                                { type: 'MemberExpression',
                                    computed: false,
                                    object: { type: 'Identifier', name: 'module' },
                                    property: { type: 'Identifier', name: 'exports' } },
                            right:
                                { type: 'FunctionExpression',
                                    id: null,
                                    params: [ { type: 'Identifier', name: 'task' } ],
                                    body:
                                        { type: 'BlockStatement',
                                            body:
                                                [ { type: 'VariableDeclaration',
                                                    declarations:
                                                        [ { type: 'VariableDeclarator',
                                                            id: { type: 'Identifier', name: 'objects' },
                                                            init: { type: 'ArrayExpression', elements: [] } } ],
                                                    kind: 'let' },
                                                    { type: 'ExpressionStatement',
                                                        expression:
                                                            { type: 'CallExpression',
                                                                callee:
                                                                    { type: 'MemberExpression',
                                                                        computed: false,
                                                                        object: { type: 'Identifier', name: 'objects' },
                                                                        property: { type: 'Identifier', name: 'push' } },
                                                                arguments:
                                                                    [ { type: 'NewExpression',
                                                                        callee: { type: 'Identifier', name: 'AssignmentExpression' },
                                                                        arguments:
                                                                            [ { type: 'Identifier', name: 'task' },
                                                                                { type: 'Identifier', name: 'requires' },
                                                                                { type: 'Identifier', name: 'next' },
                                                                                { type: 'Literal', value: null, raw: 'null' },
                                                                                { type: 'FunctionExpression',
                                                                                    id: null,
                                                                                    params: [],
                                                                                    body:
                                                                                        { type: 'BlockStatement',
                                                                                            body:
                                                                                                [ { type: 'WithStatement',
                                                                                                    object:
                                                                                                        { type: 'MemberExpression',
                                                                                                            computed: false,
                                                                                                            object:
                                                                                                                { type: 'MemberExpression',
                                                                                                                    computed: false,
                                                                                                                    object: { type: 'Identifier', name: 'task' },
                                                                                                                    property: { type: 'Identifier', name: '_scopeChain' } },
                                                                                                            property: { type: 'Identifier', name: '_scope' } },
                                                                                                    body:
                                                                                                        { type: 'BlockStatement',
                                                                                                            body:
                                                                                                                [ { type: 'ReturnStatement',
                                                                                                                    argument:
                                                                                                                        { type: 'AssignmentExpression',
                                                                                                                            operator: '=',
                                                                                                                            left: { type: 'Identifier', name: 'a', cooperative: true },
                                                                                                                            right: { type: 'Literal', value: 1, raw: '1' } } } ] } } ] },
                                                                                    generator: false,
                                                                                    expression: false,
                                                                                    async: false } ],
                                                                        cooperative: true,
                                                                        objectIndex: 0,
                                                                        objectType: 'AssignmentExpression' } ] },
                                                        cooperative: true },
                                                    { type: 'ReturnStatement',
                                                        argument:
                                                            { type: 'MemberExpression',
                                                                computed: true,
                                                                object: { type: 'Identifier', name: 'objects' },
                                                                property: { type: 'Literal', value: 0, raw: '0', cooperative: true } } } ] },
                                    generator: false,
                                    expression: false,
                                    async: false } } } ],
            sourceType: 'script' };
        let tmp = 'a = 1;';
        Compiler.build(tmp).then((out) => {
            expect(deepMatch(out.linked, expected)).toBe(true);
            done();
        }).catch((reason) => {
            if (reason.hasOwnProperty('matcherResult')) {
                done(reason);
            } else {
                done('Error: ' + reason.toString());
            }
        });
    });
    it('should allow assignment of identifiers', (done) => {
        let expected = { type: 'Program',
            body:
                [ { type: 'ExpressionStatement',
                    expression:
                        { type: 'AssignmentExpression',
                            operator: '=',
                            left:
                                { type: 'MemberExpression',
                                    computed: false,
                                    object: { type: 'Identifier', name: 'module' },
                                    property: { type: 'Identifier', name: 'exports' } },
                            right:
                                { type: 'FunctionExpression',
                                    id: null,
                                    params: [ { type: 'Identifier', name: 'task' } ],
                                    body:
                                        { type: 'BlockStatement',
                                            body:
                                                [ { type: 'VariableDeclaration',
                                                    declarations:
                                                        [ { type: 'VariableDeclarator',
                                                            id: { type: 'Identifier', name: 'objects' },
                                                            init: { type: 'ArrayExpression', elements: [] } } ],
                                                    kind: 'let' },
                                                    { type: 'ExpressionStatement',
                                                        expression:
                                                            { type: 'CallExpression',
                                                                callee:
                                                                    { type: 'MemberExpression',
                                                                        computed: false,
                                                                        object: { type: 'Identifier', name: 'objects' },
                                                                        property: { type: 'Identifier', name: 'push' } },
                                                                arguments:
                                                                    [ { type: 'NewExpression',
                                                                        callee: { type: 'Identifier', name: 'AssignmentExpression' },
                                                                        arguments:
                                                                            [ { type: 'Identifier', name: 'task' },
                                                                                { type: 'Identifier', name: 'requires' },
                                                                                { type: 'Identifier', name: 'next' },
                                                                                { type: 'Literal', value: null, raw: 'null' },
                                                                                { type: 'FunctionExpression',
                                                                                    id: null,
                                                                                    params: [],
                                                                                    body:
                                                                                        { type: 'BlockStatement',
                                                                                            body:
                                                                                                [ { type: 'WithStatement',
                                                                                                    object:
                                                                                                        { type: 'MemberExpression',
                                                                                                            computed: false,
                                                                                                            object:
                                                                                                                { type: 'MemberExpression',
                                                                                                                    computed: false,
                                                                                                                    object: { type: 'Identifier', name: 'task' },
                                                                                                                    property: { type: 'Identifier', name: '_scopeChain' } },
                                                                                                            property: { type: 'Identifier', name: '_scope' } },
                                                                                                    body:
                                                                                                        { type: 'BlockStatement',
                                                                                                            body:
                                                                                                                [ { type: 'ReturnStatement',
                                                                                                                    argument:
                                                                                                                        { type: 'AssignmentExpression',
                                                                                                                            operator: '=',
                                                                                                                            left: { type: 'Identifier', name: 'a', cooperative: true },
                                                                                                                            right: { type: 'Identifier', name: 'b' } } } ] } } ] },
                                                                                    generator: false,
                                                                                    expression: false,
                                                                                    async: false } ],
                                                                        cooperative: true,
                                                                        objectIndex: 0,
                                                                        objectType: 'AssignmentExpression' } ] },
                                                        cooperative: true },
                                                    { type: 'ReturnStatement',
                                                        argument:
                                                            { type: 'MemberExpression',
                                                                computed: true,
                                                                object: { type: 'Identifier', name: 'objects' },
                                                                property: { type: 'Literal', value: 0, raw: '0', cooperative: true } } } ] },
                                    generator: false,
                                    expression: false,
                                    async: false } } } ],
            sourceType: 'script' };
        let tmp = 'a = b;';
        Compiler.build(tmp).then((out) => {
            expect(deepMatch(out.linked, expected)).toBe(true);
            done();
        }).catch((reason) => {
            if (reason.hasOwnProperty('matcherResult')) {
                done(reason);
            } else {
                done('Error: ' + reason.toString());
            }
        });
    });
});
