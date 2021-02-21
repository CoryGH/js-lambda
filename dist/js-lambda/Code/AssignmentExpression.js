/***
 * @requirefiles {Threading/ICodeElement.js,Threading/SwitchCase.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new AssignmentExpression(task, requires, next, function () { with (task._scopeChain._scope) { return (left = arguments[0]); } })');
const defRightLiteral = esprima.parse('new AssignmentExpression(task, requires, next, null, function () { with (task._scopeChain._scope) { return (left = right); } })');
//#endregion #endif

class AssignmentExpression extends ICodeElement {
    constructor(task, requires, next, setter) {
        super(task, requires, next);
        this._setter = setter;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        AssignmentExpression._main(this, this._task, this._setter);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = -1;
        if (!this._task._paused) {
            this._schedulingTime.stop();
            AssignmentExpression._main(this, this._task, this._setter);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        const Compiler = require('./Compiler.js');
        let left = from.left;
        let right = from.right;
        let operator = from.operator;
        let isRightLiteral = Compiler._isLiteralOrObjectLiteralOrIdentifier(right);
        let wrapper = JSON.parse(JSON.stringify(isRightLiteral ? defRightLiteral : def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (parents[0].type === 'AssignmentExpression') {
                    node.cooperative = true;
                    node.operator = operator;
                    if (node.name === 'left') {
                        if (left === null) {
                            ICodeElement._replace(parents[0], node, null);
                        } else {
                            left.cooperative = true;
                            ICodeElement._replace(parents[0], node, left);
                        }
                    } else if (node.name === 'right') {
                        if (isRightLiteral) {
                            ICodeElement._replace(parents[0], node, ICodeElement._valueToLiteral(right));
                        } else {
                            ICodeElement._replace(parents[0], node, right);
                        }
                    }
                    //node.left = left;
                    //node.right = right;
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(assignmentExpression, task, setter) {
        assignmentExpression._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            assignmentExpression._schedulingTime.stop();
            return;
        }
        if (assignmentExpression._stage === 'complete') { assignmentExpression.complete(); }
        else {
            assignmentExpression._runningTime.start();
            try {
                assignmentExpression._result = setter(this._previousResult);
                assignmentExpression._runningTime.stop();
                assignmentExpression._stage = 'complete';
                assignmentExpression._schedulingTime.stop();
                setTimeout(AssignmentExpression._main, 0, assignmentExpression, task, setter);
            } catch (ex) {
                assignmentExpression._runningTime.stop();
                assignmentExpression.error(ex);
            }
        }
    }
}

//#region #ifdef NODEJS
module.exports = AssignmentExpression;
//#endregion #endif