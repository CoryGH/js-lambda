/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const ICodeLoop = require('./ICodeLoop.js');

const def = esprima.parse('new DoWhileStatement(task, requires, next, () => {body}, () => { return (test); })');
//#endregion #endif

class DoWhileStatement extends ICodeLoop {
    constructor(task, requires, next, body, test) {
        super(task, requires, next);
        this._body = body;
        this._test = test;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        DoWhileStatement._main(this, this._task, this._body, this._test);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'loop';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            DoWhileStatement._main(this, this._task, this._body, this._test);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let test = from.test;
        let body = ((from.body.type === 'BlockStatement') && (from.body.body.length === 1) ? from.body.body[0] : from.body);
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'test') { ICodeElement._replace(((from.test.type === 'BlockStatement') && (from.test.body.length !== 1) ? parents[2] : parents[0]), node, test); }
                else if (node.name === 'body') { ICodeElement._replace(wrapper, ((from.body.type === 'BlockStatement') && (from.body.body.length !== 1) ? parents[2] : parents[0]), body); }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(doWhileStatement, task, body, test) {
        doWhileStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            doWhileStatement._schedulingTime.stop();
            return;
        }
        switch (doWhileStatement._stage) {
            case 'loop':
                try {
                    doWhileStatement._runningTime.start();
                    body();
                    doWhileStatement._runningTime.stop();
                    doWhileStatement._stage = 'check';
                    doWhileStatement._schedulingTime.stop();
                    setTimeout(doWhileStatement._main, 0, doWhileStatement, task, body, test);
                } catch (ex) {
                    doWhileStatement._runningTime.stop();
                    doWhileStatement._schedulingTime.stop();
                    doWhileStatement.error(ex);
                }
                break;
            case 'check':
                try {
                    doWhileStatement._runningTime.start();
                    if (test()) {
                        doWhileStatement._runningTime.stop();
                        doWhileStatement._stage = 'loop';
                    } else {
                        doWhileStatement._runningTime.stop();
                        doWhileStatement._stage = 'complete';
                    }
                    doWhileStatement._schedulingTime.stop();
                    setTimeout(doWhileStatement._main, 0, doWhileStatement, task, body, test);
                } catch (ex) {
                    doWhileStatement._runningTime.stop();
                    doWhileStatement._schedulingTime.stop();
                    doWhileStatement.error(ex);
                }
                break;
            case 'complete':
                doWhileStatement.complete();
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = DoWhileStatement;
//#endregion #endif