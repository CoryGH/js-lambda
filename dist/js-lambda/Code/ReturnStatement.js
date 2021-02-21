/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new ReturnStatement(task, [], next, argument)');
//#endregion #endif

class ReturnStatement extends ICodeElement {
    constructor(task, requires, next, argument) {
        super(task, requires, next);
        this._argument = argument;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        ReturnStatement._main(this, this._task, this._argument);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'follow';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            ReturnStatement._main(this, this._task, this._argument);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let argument = from.argument;
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if ((node.type === 'Identifier')) {
                if (node.name === 'argument') {
                    if (argument.type === 'SequenceExpression') {
                        ICodeElement._replace(parents[1], parents[0],  argument.expressions);
                    } else {
                        ICodeElement._replace(parents[0], node,  argument);
                    }
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(returnStatement, task, argument) {
        returnStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            returnStatement._schedulingTime.stop();
            return;
        }
        switch (returnStatement._stage) {
            case 'follow':
                returnStatement.complete(argument);
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = ReturnStatement;
//#endregion #endif