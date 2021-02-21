/***
 * @requirefiles {Code/BreakStatement.js,Code/DoWhileStatement.js,Code/ForStatement.js,Code/ForInStatement.js,Code/IfStatement.js,Code/ObjectExpression.js,Code/ReturnStatement.js,Code/SwitchStatement.js,Code/VariableDeclaration.js,Code/WhileStatement.js,Code/Stopwatch.js}
 */

//#region #ifdef NODEJS
const escodegen = require('escodegen');
const esprima = require('esprima');
const ICodeElement = require('./ICodeElement.js');
const AssignmentExpression = require('./AssignmentExpression.js');
const BinaryExpression = require('./BinaryExpression.js');
const BreakStatement = require('./BreakStatement.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const DoWhileStatement = require('./DoWhileStatement.js');
const ForStatement = require('./ForStatement.js');
const ForInStatement = require('./ForInStatement.js');
const IfStatement = require('./IfStatement.js');
const ObjectExpression = require('./ObjectExpression.js');
const ReturnStatement = require('./ReturnStatement.js');
const SwitchStatement = require('./SwitchStatement.js');
const VariableDeclaration = require('./VariableDeclaration.js');
const WhileStatement = require('./WhileStatement.js');
const Stopwatch = require('./Stopwatch.js');

const def = esprima.parse('module.exports = function (task) {\nlet objects = [];\nobjectAdders;\nreturn (objects[0]);\n};');
const defObject = esprima.parse('\nobjects.push(object);');
//#endregion #endif

class Compiler {
    constructor() {

    }

    static ast(state) {
        let parseTime = new Stopwatch(process.hrtime.bigint());
        return (new Promise((resolve, reject) => {
            state.ast = esprima.parse(state.originalCode);
            parseTime.stop();
            parseTime.get().then((parseTime) => {
                state.parseTime = parseTime;
                if (state.hasOwnProperty('error')) {
                    reject(state.error);
                } else {
                    resolve(state);
                }
            }).catch((reason) => {
                reject(reason);
            });
        }));
    }

    static build(code) {
        let buildTime = new Stopwatch(process.hrtime.bigint());
        return (new Promise((resolve, reject) => {
            let state = { originalAST: esprima.parse(code), originalCode: code };
            Compiler.compile(state).then((state) => {
                //console.log(state.objects);
                Compiler.link(state).then((state) => {
                    try {
                        //console.log(state.linked);
                        state.out = escodegen.generate(state.linked);
                    } catch(ex) {
                        state.error = 'Build generation error: ' + ex.toString();
                    }
                    buildTime.stop();
                    buildTime.get().then((buildTime) => {
                        state.buildTime = buildTime;
                        if (state.hasOwnProperty('error')) {
                            reject(state.error);
                        } else {
                            resolve(state);
                        }
                    }).catch((reason) => {
                        reject(reason);
                    });
                }).catch((reason) => {
                    reject('Build linking error: ' + reason.toString());
                });
            }).catch((reason) => {
                reject('Build compilation error: ' + reason.toString());
            });
        }));
    }

    static compile(state) {
        let compileTime = new Stopwatch(process.hrtime.bigint());
        return (new Promise((resolve, reject) => {
            state.ast = JSON.parse(JSON.stringify(state.originalAST));
            state.objects = [];
            state.latest = null;
            ICodeElement._traverseInsideOut(state.ast, (parents, node) => {
                if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
                let created = null;
                switch (node.type) {
                    case 'AssignmentExpression':
                        created = AssignmentExpression._create(node, state);
                        break;
                    case 'BinaryExpression':
                        created = BinaryExpression._create(node, state);
                        break;
                    case 'BreakStatement':
                        created = BreakStatement._create(node, state);
                        break;
                    case 'DoWhileStatement':
                        created = DoWhileStatement._create(node, state);
                        break;
                    case 'ForStatement':
                        created = ForStatement._create(node, state);
                        break;
                    case 'ForInStatement':
                        created = ForInStatement._create(node, state);
                        break;
                    case 'IfStatement':
                        created = IfStatement._create(node, state);
                        break;
                    case 'ObjectExpression':
                        created = ObjectExpression._create(node, state);
                        break;
                    case 'ReturnStatement':
                        created = ReturnStatement._create(node, state);
                        break;
                    case 'SwitchStatement':
                        created = SwitchStatement._create(node, state);
                        break;
                    case 'VariableDeclaration':
                        created = VariableDeclaration._create(node, state);
                        break;
                    //case 'VariableDeclarator':
                    //    created = VariableDeclarator._create(node, state);
                    //    break;
                    case 'WhileStatement':
                        created = WhileStatement._create(node, state);
                        break;
                }
                if (created !== null) {
                    if (created instanceof Array) {
                        for (let i = created.length - 1; i >= 0; i--) {
                            created[i].objectIndex = state.objects.push(created[i].created) - 1;
                            created[i].objectType = node.type;
                            created[i].node.objectIndex = created[i].objectIndex;
                            created[i].created.objectIndex = created[i].objectIndex;
                            created[i].created.objectType = node.type;
                            let compilerReference = CompilerObjectReference._create(created[i].objectIndex);
                            ICodeElement._replace(parents[0], created[i].node, compilerReference);
                            //ICodeElement._replace(parents[0], created[i].node, created[i].created);
                        }
                    } else {
                        created.objectIndex = state.objects.push(created) - 1;
                        created.objectType = node.type;
                        node.objectIndex = created.objectIndex;
                        let compilerReference = CompilerObjectReference._create(created.objectIndex);
                        ICodeElement._replace(parents[0], node, compilerReference);
                        //ICodeElement._replace(parents[0], node, created);
                    }
                    state.latest = created;
                }
            });
            compileTime.stop();
            compileTime.get().then((compileTime) => {
                state.compileTime = compileTime;
                resolve(state);
            }).catch((reason) => { reject(reason); });
        }));
    }

    static link(state) {
        let linkTime = new Stopwatch(process.hrtime.bigint());
        return (new Promise((resolve, reject) => {
            let wrapper = JSON.parse(JSON.stringify(def));
            let objectAddersNode = ICodeElement._findNodes(wrapper, { type: 'ExpressionStatement' }, (parents, node) => {
                if ((node.expression.type === 'Identifier') && (node.expression.name === 'objectAdders')) {
                    node.cooperative = true;
                    node.expression = null;
                    return (true);
                }
            });
            let rootIndexNode = ICodeElement._findNodes(wrapper, { type: 'Literal', value: 0, raw: '0' }, (parents, node) => {
                if ((parents[0].type === 'MemberExpression' && (parents[1].type === 'ReturnStatement'))) {
                    node.cooperative = true;
                    return (true);
                }
            });
            let objectNodes = [];
            ICodeElement._crossReference(state.objects, (indexF, parentsF, nodeF, indexS, parentsS, nodeS) => {
                if (nodeF === nodeS) {
                    ICodeElement._getFirstOfType(parentsF, ICodeElement, (f_index, f_parent) => {
                        console.log('FFFF');
                        parentsF = f_parent;
                    });
                    ICodeElement._getFirstOfType(parentsS, ICodeElement, (s_index, s_parent) => {
                        console.log('SSSS');
                        parentsS = s_parent;
                    });
                    console.log("x-reference", indexF, (parentsF instanceof Array ? parentsF[0] : parentsF), nodeF, indexS, (parentsS instanceof Array ? parentsS[0] : parentsS), nodeS);
                }
            });
            for (let i = state.objects.length - 1; i >= 0; i--) {
                state.objects[i].objectIndex = (state.objects.length - 1) - i;
                //console.log(state.objects[i].objectType, state.objects[i].objectIndex);
                let objectWrapper = JSON.parse(JSON.stringify(defObject));
                let objectInsertionNode = ICodeElement._findNodes(objectWrapper, { type: 'ExpressionStatement' }, (parents, node) => {
                    if ((node.expression.type === 'CallExpression') && (node.expression.arguments.length === 1) && (node.expression.arguments[0].type === 'Identifier') && (node.expression.arguments[0].name === 'object')) {
                        node.cooperative = true;
                        return (true);
                    }
                });
                objectInsertionNode.nodes[0].expression.arguments[0] = state.objects[i];
                objectNodes.push(objectWrapper.body[0]);
            }
            ICodeElement._splice(wrapper, objectAddersNode.nodes[0], objectNodes);
            let rootIndex = state.objects.length - 1;
            rootIndexNode.nodes[0].value = rootIndex;
            //rootIndexNode.nodes[0].raw = rootIndex;
            state.linked = JSON.parse(JSON.stringify(wrapper));
            linkTime.stop();
            linkTime.get().then((linkTime) => {
                state.linkTime = linkTime;
                resolve(state);
            }).catch((reason) => { reject(reason); });
        }));
    }

    /**
     * Determine if a node represents a literal or an object literal (lacking references or identifiers.)
     * @param node The node to check.
     * @param [_checked] Used internally.  Array of nodes already searched, to prevent circular reference based stack overflows.
     * @return {boolean}
     * @access package
     */
    static _isLiteralOrObjectLiteral(node, _checked) {
        if ((node === null) || ((node instanceof Object) && (node.type === 'Literal'))) { return (true); }
        if ((!(node instanceof Array)) && (node instanceof Object) && (['ObjectExpression', 'Property', 'BinaryExpression'].indexOf(node.type) < 0)) { return (false); }
        if (arguments.length < 2) { _checked = [node]; } else { if (_checked.indexOf(node) >= 0) { return (true); } _checked.push(node); }
        for (let key in node) {
            if (node.hasOwnProperty(key) && (node[key] instanceof Object)) {
                if (node[key].type === 'Property') {
                    if (!Compiler._isLiteralOrObjectLiteral(node[key].value, _checked)) { return (false); }
                } else if (node[key].type === 'BinaryExpression') {
                    if (!Compiler._isLiteralOrObjectLiteral(node[key].left, _checked)) { return (false); }
                    if (!Compiler._isLiteralOrObjectLiteral(node[key].right, _checked)) { return (false); }
                } else {
                    if (!Compiler._isLiteralOrObjectLiteral(node[key], _checked)) { return (false); }
                }
            }
        }
        return (true);
    }

    /**
     * Determine if a node represents a literal or an object literal (lacking references or identifiers) or an identifier.
     * @param node The node to check.
     * @param [_checked] Used internally.  Array of nodes already searched, to prevent circular reference based stack overflows.
     * @return {boolean}
     * @access package
     */
    static _isLiteralOrObjectLiteralOrIdentifier(node, _checked) {
        if ((node === null) || ((node instanceof Object) && ((node.type === 'Literal') || (node.type === 'Identifier')))) { return (true); }
        if ((!(node instanceof Array)) && (node instanceof Object) && (['ObjectExpression', 'Property', 'BinaryExpression'].indexOf(node.type) < 0)) { return (false); }
        if (arguments.length < 2) { _checked = [node]; } else { if (_checked.indexOf(node) >= 0) { return (true); } _checked.push(node); }
        for (let key in node) {
            if (node.hasOwnProperty(key) && (node[key] instanceof Object)) {
                if (node[key].type === 'Property') {
                    if (!Compiler._isLiteralOrObjectLiteral(node[key].value, _checked)) { return (false); }
                } else if (node[key].type === 'BinaryExpression') {
                    if (!Compiler._isLiteralOrObjectLiteral(node[key].left, _checked)) { return (false); }
                    if (!Compiler._isLiteralOrObjectLiteral(node[key].right, _checked)) { return (false); }
                } else {
                    if (!Compiler._isLiteralOrObjectLiteral(node[key], _checked)) { return (false); }
                }
            }
        }
        return (true);
    }
}

//#region #ifdef NODEJS
module.exports = Compiler;
//#endregion #endif