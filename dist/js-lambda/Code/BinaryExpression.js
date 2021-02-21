/***
 * @requirefiles {Threading/ICodeElement.js,Threading/SwitchCase.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new BinaryExpression(task, [], next, function (previousResult) { with (task._scopeChain._scope) { return (left == right); } })');
//#endregion #endif

class BinaryExpression extends ICodeElement {
    constructor(task, requires, next, expression) {
        super(task, requires, next);
        this._expression = expression;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        BinaryExpression._main(this, this._task, this._expression);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'express';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            BinaryExpression._main(this, this._task, this._expression);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let left = from.left;
        let right = from.right;
        let operator = from.operator;
        let wrapper = JSON.parse(JSON.stringify(def));
        let expressions = ICodeElement._findNodes(wrapper, { type: 'BinaryExpression' }, (parents, node) => {
            node.cooperative = true;
            node.operator = operator;
            return (true);
        });
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (expressions.nodes.indexOf(parents[0]) >= 0) {
                    if (node.name === 'left') {
                        if (left === null) {
                            ICodeElement._replace(parents[0], node, null);
                        } else {
                            left.cooperative = true;
                            ICodeElement._replace(parents[0], node, left);
                        }
                    } else if (node.name === 'right') {
                        if (right === null) {
                            ICodeElement._replace(parents[0], node, null);
                        } else {
                            ICodeElement._replace(parents[0], node, right);
                        }
                    }
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(binaryExpression, task, expression) {
        binaryExpression._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            binaryExpression._schedulingTime.stop();
            return;
        }
        if (binaryExpression._stage === 'complete') { binaryExpression.complete(); }
        else {
            binaryExpression._runningTime.start();
            try {
                binaryExpression._result = expression(this._previousResult);
                binaryExpression._runningTime.stop();
                binaryExpression._stage = 'complete';
                binaryExpression._schedulingTime.stop();
                setTimeout(BinaryExpression._main, 0, binaryExpression, task, expression);
            } catch (ex) {
                binaryExpression._runningTime.stop();
                binaryExpression.error(ex);
            }
        }
    }
}

//#region #ifdef NODEJS
module.exports = BinaryExpression;
//#endregion #endif