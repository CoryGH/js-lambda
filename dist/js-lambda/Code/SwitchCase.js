/***
 * @requirefiles {Code/CompilerObjectReference.js,Code/ICodeElement.js,Code/StatementSeries.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const StatementSeries = require('./StatementSeries.js');

const defEmpty = esprima.parse('[]');
const def = esprima.parse('new SwitchCase(task, [], next, () => { return (test); }, consequent)');
//#endregion #endif

class SwitchCase extends ICodeElement {
    constructor(task, requires, next, test, consequent) {
        super(task, requires, next);
        this._test = test;
        this._consequent = consequent;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        SwitchCase._main(this, this._task, this._test, this._consequent);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'check';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            SwitchCase._main(this, this._task, this._test, this._consequent);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let test = from.test;
        let consequent = StatementSeries._create(from.consequent);
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'test') { ICodeElement._replace(((from.test !== null) && (from.test.type === 'BlockStatement') && (from.test.body.length !== 1) ? parents[2] : parents[0]), node, test); }
                else if (node.name === 'consequent') {
                    if ((consequent instanceof Array) && (consequent.length === 0)) {
                        ICodeElement._replace(parents[0], node, defEmpty.body[0].expression);
                    } else {
                        ICodeElement._replace(parents[1], parents[0], consequent);
                    }
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return (wrapper.body[0].expression);
    }
    static _main(switchCase, task, test, consequent) {
        switchCase._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            switchCase._schedulingTime.stop();
            return;
        }
        switch (switchCase._stage) {
            case 'check':
                try {
                    switchCase._runningTime.start();
                    if (test()) {
                        switchCase._runningTime.stop();
                        switchCase._stage = 'consequent';
                    } else {
                        switchCase._stage = 'complete';
                    }
                    switchCase._schedulingTime.stop();
                    setTimeout(SwitchCase._main, 0, switchCase, task, test, consequent);
                } catch (ex) {
                    switchCase._runningTime.stop();
                    switchCase._schedulingTime.stop();
                    switchCase.error(ex);
                }
                break;
            case 'consequent':
                try {
                    switchCase._runningTime.start();
                    consequent();
                    switchCase._runningTime.stop();
                    switchCase._stage = 'complete';
                    switchCase._schedulingTime.stop();
                    setTimeout(SwitchCase._main, 0, switchCase, task, test, consequent);
                } catch (ex) {
                    switchCase._runningTime.stop();
                    switchCase._schedulingTime.stop();
                    switchCase.error(ex);
                }
                break;
            case 'complete':
                switchCase.complete();
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = SwitchCase;
//#endregion #endif