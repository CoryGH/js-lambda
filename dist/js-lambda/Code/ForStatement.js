/***
 * @requirefiles {Threading/ICodeElement.js}
 */

//#region #ifdef NODEJS
const esprima = require('esprima');
const Compiler = require('../Code/Compiler.js');
const CompilerObjectReference = require('./CompilerObjectReference.js');
const ICodeElement = require('./ICodeElement.js');
const ICodeLoop = require('./ICodeLoop.js');

const def = esprima.parse('new ForStatement(task, [], next, () => {init}, () => { return (test); }, () => {update}, () => {body})');
//#endregion #endif

class ForStatement extends ICodeLoop {
    constructor(task, requires, next, init, test, update, body) {
        super(task, requires, next);
        this._init = init;
        this._test = test;
        this._update = update;
        this._body = body;
        this._schedulingTime.stop();
    }
    resume(previousResult) {
        super.resume.apply(this, arguments);
        ForStatement._main(this, this._task, this._init, this._test, this._update, this._body);
    }
    start(previousResult) {
        super.start.apply(this, arguments);
        this._stage = 'init';
        if (!this._task._paused) {
            this._schedulingTime.stop();
            ForStatement._main(this, this._task, this._init, this._test, this._update, this._body);
        } else {
            this._schedulingTime.stop();
        }
    }
    static _create(from, state) {
        let init = from.init;
        let test = from.test;
        let update = from.update;
        let body = ((from.body.type === 'BlockStatement') && (from.body.body.length === 1) ? from.body.body[0] : from.body);
        let wrapper = JSON.parse(JSON.stringify(def));
        ICodeElement._traverse(wrapper, (parents, node) => {
            if (node.hasOwnProperty('cooperative') || (node instanceof CompilerObjectReference)) { return; }
            if (node.type === 'Identifier') {
                if (node.name === 'init') {
                    if (init === null) {
                        ICodeElement._replace(parents[2], parents[1], []);
                    } else {
                        ICodeElement._replace(((from.init.type === 'BlockStatement') && (from.init.body.length !== 1) ? parents[2] : parents[0]), node, init);
                    }
                } else if (node.name === 'test') {
                    if (test === null) {
                        ICodeElement._replace(parents[2], parents[1], []);
                    } else {
                        ICodeElement._replace(((from.test.type === 'BlockStatement') && (from.test.body.length !== 1) ? parents[2] : parents[0]), node, test);
                    }
                } else if (node.name === 'update') {
                    if (update === null) {
                        ICodeElement._replace(parents[2], parents[1], []);
                    } else {
                        ICodeElement._replace(((from.update.type === 'BlockStatement') && (from.update.body.length !== 1) ? parents[2] : parents[0]), node, update);
                    }
                } else if (node.name === 'body') { ICodeElement._replace(wrapper, ((from.body.type === 'BlockStatement') && (from.body.body.length !== 1) ? parents[2] : parents[0]), body); }
            }
        });
        wrapper.body[0].expression.cooperative = true;
        return ([{ node: from, created: wrapper.body[0].expression }]);
    }
    static _main(forStatement, task, init, test, update, body) {
        forStatement._schedulingTime.start();
        if (task._paused) {
            task._halted = true;
            forStatement._schedulingTime.stop();
            return;
        }
        switch (forStatement._stage) {
            case 'init':
                try {
                    forStatement._runningTime.start();
                    init();
                    forStatement._runningTime.stop();
                    forStatement._stage = 'check';
                    forStatement._schedulingTime.stop();
                    setTimeout(forStatement._main, 0, forStatement, task, init, test, update, body);
                } catch (ex) {
                    forStatement._runningTime.stop();
                    forStatement._schedulingTime.stop();
                    forStatement.error(ex);
                }
                break;
            case 'check':
                try {
                    forStatement._runningTime.start();
                    if (test()) {
                        forStatement._runningTime.stop();
                        forStatement._stage = 'loop';
                    } else {
                        forStatement._runningTime.stop();
                        forStatement._stage = 'complete';
                    }
                    forStatement._schedulingTime.stop();
                    setTimeout(forStatement._main, 0, forStatement, task, init, test, update, body);
                } catch (ex) {
                    forStatement._runningTime.stop();
                    forStatement._schedulingTime.stop();
                    forStatement.error(ex);
                }
                break;
            case 'loop':
                try {
                    forStatement._runningTime.start();
                    body();
                    forStatement._runningTime.stop();
                    forStatement._stage = 'update';
                    forStatement._schedulingTime.stop();
                    setTimeout(forStatement._main, 0, forStatement, task, init, test, update, body);
                } catch (ex) {
                    forStatement._runningTime.stop();
                    forStatement._schedulingTime.stop();
                    forStatement.error(ex);
                }
                break;
            case 'update':
                try {
                    forStatement._runningTime.start();
                    update();
                    forStatement._runningTime.stop();
                    forStatement._stage = 'check';
                    forStatement._schedulingTime.stop();
                    setTimeout(forStatement._main, 0, forStatement, task, init, test, update, body);
                } catch (ex) {
                    forStatement._runningTime.stop();
                    forStatement._schedulingTime.stop();
                    forStatement.error(ex);
                }
                break;
            case 'complete':
                forStatement.complete();
                break;
        }
    }
}

//#region #ifdef NODEJS
module.exports = ForStatement;
//#endregion #endif