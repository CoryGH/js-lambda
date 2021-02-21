/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const ICodeLoop = require('./ICodeLoop.js');

const def = esprima.parse('new WhileStatement(task, [], next, () => { return (test); }, () => {body})');
//#endregion #endif

class WhileStatement extends ICodeLoop {
    constructor(task, requires, next, test, body) {
        super(task, requires, next);
        this._test = test;
        this._body = body;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        WhileStatement._main(this, this._task, this._test, this._body);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'check';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            WhileStatement._main(this, this._task, this._test, this._body);
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
    static _main(whileStatement, task, test, body) {
        whileStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            whileStatement._schedulingTime.stop();
            return;
        }
        switch (whileStatement._stage) {
            case 'check':
                try {
                    whileStatement._runningTime.start();
                    if (test()) {
                        whileStatement._runningTime.stop();
                        whileStatement._stage = 'loop';
                    } else {
                        whileStatement._runningTime.stop();
                        whileStatement._stage = 'complete';
                    }
                    whileStatement._schedulingTime.stop();
                    setTimeout(whileStatement._main, 0, whileStatement, task, test, body);
                } catch (ex) {
                    whileStatement._runningTime.stop();
                    whileStatement._schedulingTime.stop();
                    whileStatement.error(ex);
                }
                break;
            case 'loop':
                try {
                    whileStatement._runningTime.start();
                    body();
                    whileStatement._runningTime.stop();
                    whileStatement._stage = 'check';
                    whileStatement._schedulingTime.stop();
                    setTimeout(whileStatement._main, 0, whileStatement, task, test, body);
                } catch (ex) {
                    whileStatement._runningTime.stop();
                    whileStatement._schedulingTime.stop();
                    whileStatement.error(ex);
                }
                break;
            case 'complete':
                whileStatement.complete();
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = WhileStatement;
//#endregion #endif