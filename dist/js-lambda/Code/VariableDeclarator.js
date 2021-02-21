/***
 * @requirefiles {Code/Compiler.js,Threading/ICodeElement.js,Threading/SwitchCase.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new VariableDeclarator(task, [], next, "id", () => { return (value); })');
const defLiteral = esprima.parse('new VariableDeclarator(task, [], next, "id", value)');
//#endregion #endif

class VariableDeclarator extends ICodeElement {
    constructor(task, requires, next, id, value) {
        super(task, requires, next);
        this._id = id;
        this._value = value;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        VariableDeclarator._main(this, this._task, this._id, this._value);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = -1;
        if (!this._task._paused) {
            this._schedulingTime.stop();
            VariableDeclarator._main(this, this._task, this._id, this._value);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        const Compiler = require('./Compiler.js');
        let id = from.id;
        let init = from.init;
        let isLiteral = Compiler._isLiteralOrObjectLiteralOrIdentifier(init);
        let wrapper = JSON.parse(JSON.stringify(isLiteral ? defLiteral : def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            node.cooperative = true;
            if (node.type === 'Literal') {
                if (node.value === 'id') {
                    node.value = id.name;
                    node.raw = '"' + id.name.replace(/\"/g, '\\"');
                }
            } else if (node.type === 'Identifier') {
                if (node.name === 'value') {
                    if (isLiteral) {
                        ICodeElement._replace(parents[0], node, ICodeElement._valueToLiteral(init));
                    } else {
                        ICodeElement._replace(wrapper, ((init.type === 'BlockStatement') && (init.body.length !== 1) ? parents[2] : parents[0]), init);
                    }
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(variableDeclarator, task, id, value) {
        variableDeclarator._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            variableDeclarator._schedulingTime.stop();
            return;
        }
        if (variableDeclarator._stage === 'complete') { variableDeclarator.complete(); }
        else {
            let index = parseInt(variableDeclarator._stage) + 1;
            if (index < id.length) {
                variableDeclarator._runningTime.start();
                id[index].start().then((result) => {
                    variableDeclarator._runningTime.stop();
                    variableDeclarator._stage = index;
                    variableDeclarator._schedulingTime.stop();
                    setTimeout(VariableDeclarator._main, 0, variableDeclarator, task, id, value);
                }).catch((reason) => {
                    variableDeclarator._runningTime.stop();
                    variableDeclarator.error(reason);
                });
            } else {
                variableDeclarator._stage = 'complete';
            }
        }
    }
}

//#region #ifdef NODEJS
module.exports = VariableDeclarator;
//#endregion #endif