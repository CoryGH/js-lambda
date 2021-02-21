
const escodegen = require('escodegen');
const esprima = require('esprima');
const fs = require('fs');
const Compiler = require('./dist/js-lambda/Code/Compiler.js');

let tmp = 'a = b;';
Compiler.build(tmp).then((out) => {
    console.log(out.linked);
    console.log(out.out);
}).catch((reason) => {
    console.log('Error: ' + reason.toString());
});
return;
tmp = fs.readFileSync('./test/cookie.js', { encoding: 'utf8' }).trim();

Compiler.build(tmp).then((out) => {
    console.log(out.compileTime);
    console.log(out.code);
    console.log(JSON.stringify(out.ast, null, 2));
    console.log('======');
    console.log(out.out);
}).catch((reason) => {
    console.log('Error: ' + reason.toString());
});

let a = {
    "type": "SwitchStatement",
    "discriminant": {
        "type": "Identifier",
        "name": "a"
    },
    "cases": [
        {
            "type": "SwitchCase",
            "test": {
                "type": "Literal",
                "value": 1,
                "raw": "1"
            },
            "consequent": []
        },
        {
            "type": "SwitchCase",
            "test": {
                "type": "Literal",
                "value": 2,
                "raw": "2"
            },
            "consequent": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": "a"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 1,
                            "raw": "1"
                        }
                    }
                },
                {
                    "type": "BreakStatement",
                    "label": null
                }
            ]
        },
        {
            "type": "SwitchCase",
            "test": {
                "type": "Literal",
                "value": 3,
                "raw": "3"
            },
            "consequent": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": "a"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 2,
                            "raw": "2"
                        }
                    }
                },
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": "a"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 3,
                            "raw": "3"
                        }
                    }
                },
                {
                    "type": "ReturnStatement",
                    "argument": null
                }
            ]
        },
        {
            "type": "SwitchCase",
            "test": {
                "type": "Literal",
                "value": 4,
                "raw": "4"
            },
            "consequent": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": "a"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 4,
                            "raw": "4"
                        }
                    }
                },
                {
                    "type": "BreakStatement",
                    "label": null
                }
            ]
        },
        {
            "type": "SwitchCase",
            "test": null,
            "consequent": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "Identifier",
                            "name": "a"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 5,
                            "raw": "5"
                        }
                    }
                },
                {
                    "type": "BreakStatement",
                    "label": null
                }
            ]
        }
    ]
};

let arrow = {
    type: 'Program',
    body:
        [
            {
                type: 'ExpressionStatement',
                expression:
                {
                    type: 'ArrowFunctionExpression',
                    id: null,
                    params: [],
                    body:
                    {
                        type: 'BlockStatement',
                        body:
                            [
                                {
                                    type: 'ExpressionStatement',
                                    expression: { type: 'Identifier', name: 'statement' }
                                }
                            ]
                    },
                    generator: false,
                    expression: false,
                    async: false
                    }
                }
            ],
    sourceType: 'script'
};