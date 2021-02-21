/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new BreakStatement(task, [], next, \'label\')');
//#endregion #endif

class BreakStatement extends ICodeElement {
    constructor(task, requires, next, label) {
        super(task, requires, next);
        this._label = label;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        BreakStatement._main(this, this._task, this._label);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'follow';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            BreakStatement._main(this, this._task, this._label);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let label = from.label;
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Literal') {
                if (node.value === 'label')
                if (label !== null) {
                    node.value = label.name;
                    node.raw = '\'' + label.name.replace(/\'/g, '\\\'') + '\'';
                } else {
                    ICodeElement._replace(parents[1], parents[0], []);
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(breakStatement, task, label) {
        breakStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            breakStatement._schedulingTime.stop();
            return;
        }
        switch (breakStatement._stage) {
            case 'follow':
                breakStatement.complete(label);
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = BreakStatement;
//#endregion #endif