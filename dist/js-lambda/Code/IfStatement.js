/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');

const def = esprima.parse('new IfStatement(task, [], next, () => { return (test); }, () => {consequent}, () => {alternate})');
//#endregion #endif

class IfStatement extends ICodeElement {
    constructor(task, requires, next, test, consequent, alternate) {
        super(task, requires, next);
        this._test = test;
        this._consequent = consequent;
        this._alternate = alternate;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        IfStatement._main(this, this._task, this._test, this._consequent, this._alternate);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'check';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            IfStatement._main(this, this._task, this._test, this._consequent, this._alternate);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let test = from.test;
        let consequent = ((from.consequent.type === 'BlockStatement') && (from.consequent.body.length === 1) ? from.consequent.body[0] : from.consequent);
        let alternate = (from.alternate === null ? null : ((from.alternate.type === 'BlockStatement') && (from.alternate.body.length === 1) ? from.alternate.body[0] : from.alternate));
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'test') { ICodeElement._replace(((from.test.type === 'BlockStatement') && (from.test.body.length !== 1) ? parents[2] : parents[0]), node, test); }
                else if (node.name === 'consequent') { ICodeElement._replace(wrapper, ((from.consequent.type === 'BlockStatement') && (from.consequent.body.length !== 1) ? parents[2] : parents[0]), consequent); }
                else if (node.name === 'alternate') {
                    if (alternate !== null) {
                        ICodeElement._replace(wrapper, ((from.alternate.type === 'BlockStatement') && (from.alternate.body.length !== 1) ? parents[2] : parents[0]), alternate);
                    }
                }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(ifStatement, task, test, consequent, alternate) {
        ifStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            ifStatement._schedulingTime.stop();
            return;
        }
        switch (ifStatement._stage) {
            case 'check':
                try {
                    ifStatement._runningTime.start();
                    if (test()) {
                        ifStatement._runningTime.stop();
                        ifStatement._stage = 'consequent';
                    } else {
                        ifStatement._stage = 'alternate';
                    }
                    ifStatement._schedulingTime.stop();
                    setTimeout(IfStatement._main, 0, ifStatement, task, test, consequent, alternate);
                } catch (ex) {
                    ifStatement._runningTime.stop();
                    ifStatement._schedulingTime.stop();
                    ifStatement.error(ex);
                }
                break;
            case 'consequent':
                try {
                    ifStatement._runningTime.start();
                    consequent();
                    ifStatement._runningTime.stop();
                    ifStatement._stage = 'complete';
                    ifStatement._schedulingTime.stop();
                    setTimeout(IfStatement._main, 0, ifStatement, task, test, consequent, alternate);
                } catch (ex) {
                    ifStatement._runningTime.stop();
                    ifStatement._schedulingTime.stop();
                    ifStatement.error(ex);
                }
                break;
            case 'alternate':
                try {
                    ifStatement._runningTime.start();
                    alternate();
                    ifStatement._runningTime.stop();
                    ifStatement._stage = 'complete';
                    ifStatement._schedulingTime.stop();
                    setTimeout(IfStatement._main, 0, ifStatement, task, test, consequent, alternate);
                } catch (ex) {
                    ifStatement._runningTime.stop();
                    ifStatement._schedulingTime.stop();
                    ifStatement.error(ex);
                }
                break;
            case 'complete':
                ifStatement.complete();
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = IfStatement;
//#endregion #endif